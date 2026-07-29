import { normalizeIp } from './ipUtils.js';

const DEFAULT_PATH_WEIGHTS = new Map([
  ['/.env', 8],
  ['/.git/', 8],
  ['/wp-admin', 6],
  ['/wp-login.php', 6],
  ['/phpmyadmin', 6],
  ['/server-status', 6],
  ['/actuator', 5],
  ['/vendor/phpunit', 7]
]);

function pathWeight(path) {
  if (DEFAULT_PATH_WEIGHTS.has(path)) return DEFAULT_PATH_WEIGHTS.get(path);
  if (/\.(zip|tar|bak|sql|old)$/i.test(path)) return 5;
  return 1;
}

export class Suspicious404ProtectionService {
  constructor({
    store,
    logger,
    windowMs = 60_000,
    uniquePathThreshold = 20,
    suspiciousScoreThreshold = 28,
    baseBlockMs = 120_000,
    allowlist = [],
    now = () => Date.now()
  }) {
    this.store = store;
    this.logger = logger;
    this.windowMs = windowMs;
    this.uniquePathThreshold = uniquePathThreshold;
    this.suspiciousScoreThreshold = suspiciousScoreThreshold;
    this.baseBlockMs = baseBlockMs;
    this.allowlist = new Set(allowlist.map(normalizeIp));
    this.now = now;
  }

  async register404({ clientIp, path, authenticated = false, userAgent = '' }) {
    const ip = normalizeIp(clientIp);
    if (!ip || this.allowlist.has(ip)) return { blocked: false, reason: 'allowlist' };

    const activeBlock = await this.getBlock(ip);
    if (activeBlock.active) return { blocked: true, reason: 'already_blocked', block: activeBlock };

    const key = `abuse:404:${ip}`;
    const current = (await this.store.get(key)) ?? { seen: {}, score: 0, requests: 0, firstSeenAt: this.now(), lastSeenAt: this.now() };
    const seen = current.seen;
    if (!seen[path]) {
      seen[path] = { weight: pathWeight(path), hits: 0 };
      current.score += seen[path].weight;
    }
    seen[path].hits += 1;
    current.requests += 1;
    current.lastSeenAt = this.now();

    await this.store.set(key, current, this.windowMs);

    const uniquePathCount = Object.keys(seen).length;
    const shouldBlock = !authenticated && uniquePathCount >= this.uniquePathThreshold && current.score >= this.suspiciousScoreThreshold;

    if (!shouldBlock) {
      return { blocked: false, score: current.score, uniquePathCount };
    }

    const offenderKey = `abuse:offender:${ip}`;
    const offenderCount = ((await this.store.get(offenderKey)) ?? 0) + 1;
    await this.store.set(offenderKey, offenderCount, 7 * 24 * 60 * 60 * 1000);

    const durationMs = this.baseBlockMs * offenderCount;
    const block = {
      ip,
      reason: 'suspicious_404_burst',
      triggeringPaths: Object.keys(seen),
      threshold: { uniquePathThreshold: this.uniquePathThreshold, suspiciousScoreThreshold: this.suspiciousScoreThreshold },
      startedAt: this.now(),
      durationMs,
      expiresAt: this.now() + durationMs,
      userAgent,
      authenticated
    };

    await this.store.set(`abuse:block:${ip}`, block, durationMs);
    this.logger.log({
      type: 'temporary_block',
      ip,
      reason: block.reason,
      triggeringPaths: block.triggeringPaths,
      durationMs,
      threshold: block.threshold
    });

    return { blocked: true, block, score: current.score, uniquePathCount };
  }

  async getBlock(clientIp) {
    const ip = normalizeIp(clientIp);
    const block = await this.store.get(`abuse:block:${ip}`);
    if (!block) return { active: false };
    return { active: block.expiresAt > this.now(), ...block };
  }

  async manualUnblock(clientIp, admin) {
    const ip = normalizeIp(clientIp);
    await this.store.del(`abuse:block:${ip}`);
    this.logger.log({ type: 'manual_unblock', ip, admin });
    return { unblocked: true, ip };
  }
}
