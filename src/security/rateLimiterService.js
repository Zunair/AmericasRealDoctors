export class RateLimiterService {
  constructor({ store, fallbackLocalLimit = 5, fallbackWindowMs = 60_000, now = () => Date.now() }) {
    this.store = store;
    this.fallbackLocalLimit = fallbackLocalLimit;
    this.fallbackWindowMs = fallbackWindowMs;
    this.now = now;
    this.localFallback = new Map();
  }

  async checkLimit({ scopeKey, limit, windowMs, endpointType = 'public' }) {
    const key = `rl:${scopeKey}`;
    try {
      const run = async () => {
        const current = (await this.store.get(key)) ?? { count: 0, resetAt: this.now() + windowMs };
        if (current.resetAt <= this.now()) {
          current.count = 0;
          current.resetAt = this.now() + windowMs;
        }
        current.count += 1;
        await this.store.set(key, current, windowMs);
        return { allowed: current.count <= limit, remaining: Math.max(0, limit - current.count), fallback: false };
      };

      if (typeof this.store.withKeyLock === 'function') {
        return await this.store.withKeyLock(key, run);
      }
      return await run();
    } catch {
      return this.#fallback(endpointType, scopeKey);
    }
  }

  #fallback(endpointType, scopeKey) {
    const strict = endpointType === 'sensitive';
    const effectiveLimit = strict ? this.fallbackLocalLimit : this.fallbackLocalLimit * 4;
    const now = this.now();
    const current = this.localFallback.get(scopeKey) ?? { count: 0, resetAt: now + this.fallbackWindowMs };
    if (current.resetAt <= now) {
      current.count = 0;
      current.resetAt = now + this.fallbackWindowMs;
    }
    current.count += 1;
    this.localFallback.set(scopeKey, current);
    return { allowed: current.count <= effectiveLimit, remaining: Math.max(0, effectiveLimit - current.count), fallback: true };
  }
}
