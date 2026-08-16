import test from 'node:test';
import assert from 'node:assert/strict';
import { ProxyTrustService } from '../../src/security/proxyTrustService.js';
import { normalizeIp } from '../../src/security/ipUtils.js';

test('ignores spoofed forwarded headers when request is not from trusted proxy', () => {
  const trust = new ProxyTrustService({ trustedProxyIps: ['172.16.0.10'] });
  const resolved = trust.resolveClientIp({
    connectionIp: '203.0.113.5',
    headers: { 'x-forwarded-for': '1.1.1.1' }
  });

  assert.equal(resolved.clientIp, '203.0.113.5');
  assert.equal(resolved.source, 'connection');
});

test('uses verified header from trusted proxy', () => {
  const trust = new ProxyTrustService({ trustedProxyIps: ['172.16.0.10'], verifiedHeader: 'cf-connecting-ip' });
  const resolved = trust.resolveClientIp({
    connectionIp: '172.16.0.10',
    headers: { 'cf-connecting-ip': '2001:DB8::1' }
  });

  assert.equal(resolved.clientIp, '2001:db8::1');
  assert.equal(resolved.source, 'cf-connecting-ip');
});

test('normalizes ipv4 and ipv6 values', () => {
  assert.equal(normalizeIp('::ffff:192.168.1.2'), '192.168.1.2');
  assert.equal(normalizeIp('2001:DB8::1'), '2001:db8::1');
});
