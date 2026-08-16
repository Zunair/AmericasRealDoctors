import test from 'node:test';
import assert from 'node:assert/strict';
import { InMemoryDistributedStore } from '../../src/security/inMemoryDistributedStore.js';
import { RateLimiterService } from '../../src/security/rateLimiterService.js';

test('rate limits are shared across multiple application instances', async () => {
  const store = new InMemoryDistributedStore();
  const instanceA = new RateLimiterService({ store });
  const instanceB = new RateLimiterService({ store });

  await instanceA.checkLimit({ scopeKey: 'login:1.1.1.1', limit: 2, windowMs: 60_000, endpointType: 'sensitive' });
  await instanceB.checkLimit({ scopeKey: 'login:1.1.1.1', limit: 2, windowMs: 60_000, endpointType: 'sensitive' });
  const third = await instanceA.checkLimit({ scopeKey: 'login:1.1.1.1', limit: 2, windowMs: 60_000, endpointType: 'sensitive' });

  assert.equal(third.allowed, false);
});

test('fallback mode protects sensitive endpoints if distributed store is unavailable', async () => {
  const store = new InMemoryDistributedStore();
  store.setFailMode(true);
  const limiter = new RateLimiterService({ store, fallbackLocalLimit: 2 });

  const a = await limiter.checkLimit({ scopeKey: 'login:2.2.2.2', limit: 50, windowMs: 60_000, endpointType: 'sensitive' });
  const b = await limiter.checkLimit({ scopeKey: 'login:2.2.2.2', limit: 50, windowMs: 60_000, endpointType: 'sensitive' });
  const c = await limiter.checkLimit({ scopeKey: 'login:2.2.2.2', limit: 50, windowMs: 60_000, endpointType: 'sensitive' });

  assert.equal(a.fallback, true);
  assert.equal(b.allowed, true);
  assert.equal(c.allowed, false);
});

test('concurrent requests still enforce distributed limit', async () => {
  const store = new InMemoryDistributedStore();
  const limiter = new RateLimiterService({ store });

  const results = await Promise.all(
    Array.from({ length: 6 }, () => limiter.checkLimit({ scopeKey: 'search:3.3.3.3', limit: 3, windowMs: 60_000 }))
  );

  const allowedCount = results.filter((item) => item.allowed).length;
  assert.equal(allowedCount, 3);
});
