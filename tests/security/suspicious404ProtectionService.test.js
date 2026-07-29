import test from 'node:test';
import assert from 'node:assert/strict';
import { InMemoryDistributedStore } from '../../src/security/inMemoryDistributedStore.js';
import { SecurityAuditLogger } from '../../src/security/auditLogger.js';
import { Suspicious404ProtectionService } from '../../src/security/suspicious404ProtectionService.js';

function createService(overrides = {}) {
  let now = 1000;
  const clock = () => now;
  const advance = (ms) => {
    now += ms;
  };

  const store = overrides.store ?? new InMemoryDistributedStore();
  const logger = overrides.logger ?? new SecurityAuditLogger();
  const service = new Suspicious404ProtectionService({
    store,
    logger,
    windowMs: 60_000,
    uniquePathThreshold: 3,
    suspiciousScoreThreshold: 10,
    baseBlockMs: 3_000,
    now: clock,
    ...overrides
  });

  return { service, logger, advance, store };
}

test('suspicious path weighting triggers temporary block and logs audit event', async () => {
  const { service, logger } = createService();
  await service.register404({ clientIp: '4.4.4.4', path: '/.env' });
  await service.register404({ clientIp: '4.4.4.4', path: '/.git/' });
  const result = await service.register404({ clientIp: '4.4.4.4', path: '/wp-admin' });

  assert.equal(result.blocked, true);
  assert.equal(logger.records[0].type, 'temporary_block');
});

test('ordinary 404s alone do not trigger block', async () => {
  const { service } = createService();
  await service.register404({ clientIp: '5.5.5.5', path: '/article/old-link' });
  await service.register404({ clientIp: '5.5.5.5', path: '/favicon2.ico' });
  const result = await service.register404({ clientIp: '5.5.5.5', path: '/docs/not-found' });

  assert.equal(result.blocked, false);
});

test('temporary block expires automatically', async () => {
  const { service, advance } = createService();
  await service.register404({ clientIp: '6.6.6.6', path: '/.env' });
  await service.register404({ clientIp: '6.6.6.6', path: '/.git/' });
  await service.register404({ clientIp: '6.6.6.6', path: '/wp-login.php' });

  const activeBlock = await service.getBlock('6.6.6.6');
  assert.equal(activeBlock.active, true);

  advance(10_000);
  const expiredBlock = await service.getBlock('6.6.6.6');
  assert.equal(expiredBlock.active, false);
});

test('repeat offenders receive escalating block durations', async () => {
  const { service, advance } = createService();

  const first = await service.register404({ clientIp: '7.7.7.7', path: '/.env' });
  assert.equal(first.blocked, false);
  await service.register404({ clientIp: '7.7.7.7', path: '/.git/' });
  const blockedOnce = await service.register404({ clientIp: '7.7.7.7', path: '/wp-admin' });

  const firstDuration = blockedOnce.block.durationMs;
  advance(firstDuration + 100);

  await service.register404({ clientIp: '7.7.7.7', path: '/.env' });
  await service.register404({ clientIp: '7.7.7.7', path: '/.git/' });
  const blockedTwice = await service.register404({ clientIp: '7.7.7.7', path: '/wp-admin' });

  assert.ok(blockedTwice.block.durationMs > firstDuration);
});

test('allowlisted addresses are never auto-blocked', async () => {
  const { service } = createService({ allowlist: ['8.8.8.8'] });
  const result = await service.register404({ clientIp: '8.8.8.8', path: '/.env' });
  assert.equal(result.reason, 'allowlist');
});

test('authenticated users are safeguarded from automatic IP blocks', async () => {
  const { service } = createService();
  await service.register404({ clientIp: '9.9.9.9', path: '/.env', authenticated: true });
  await service.register404({ clientIp: '9.9.9.9', path: '/.git/', authenticated: true });
  const result = await service.register404({ clientIp: '9.9.9.9', path: '/wp-admin', authenticated: true });
  assert.equal(result.blocked, false);
});

test('manual unblock records admin action', async () => {
  const { service, logger } = createService();
  await service.register404({ clientIp: '10.10.10.10', path: '/.env' });
  await service.register404({ clientIp: '10.10.10.10', path: '/.git/' });
  await service.register404({ clientIp: '10.10.10.10', path: '/wp-admin' });

  await service.manualUnblock('10.10.10.10', 'admin@example.com');
  const block = await service.getBlock('10.10.10.10');

  assert.equal(block.active, false);
  assert.equal(logger.records.at(-1).type, 'manual_unblock');
});
