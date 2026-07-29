import { normalizeIp } from './ipUtils.js';

export class ProxyTrustService {
  constructor({ trustedProxyIps = [], verifiedHeader = 'x-real-ip' } = {}) {
    this.trustedProxyIps = new Set(trustedProxyIps.map(normalizeIp));
    this.verifiedHeader = verifiedHeader.toLowerCase();
  }

  resolveClientIp({ connectionIp, headers = {} }) {
    const normalizedConnectionIp = normalizeIp(connectionIp);
    const trusted = this.trustedProxyIps.has(normalizedConnectionIp);
    if (!trusted) {
      return { clientIp: normalizedConnectionIp, source: 'connection' };
    }

    const verifiedHeaderValue = headers[this.verifiedHeader] ?? headers[this.verifiedHeader.toLowerCase()];
    if (verifiedHeaderValue) {
      return { clientIp: normalizeIp(verifiedHeaderValue), source: this.verifiedHeader };
    }

    const forwarded = headers['x-forwarded-for'];
    if (forwarded) {
      const first = forwarded.split(',')[0];
      return { clientIp: normalizeIp(first), source: 'x-forwarded-for' };
    }

    return { clientIp: normalizedConnectionIp, source: 'connection' };
  }
}
