import { isIP } from 'node:net';

export function normalizeIp(ip) {
  if (!ip) return '';
  const trimmed = ip.trim().toLowerCase();
  if (trimmed.startsWith('::ffff:')) {
    const v4 = trimmed.replace('::ffff:', '');
    return isIP(v4) === 4 ? v4 : trimmed;
  }
  return trimmed;
}

export function isValidIp(ip) {
  return isIP(normalizeIp(ip)) !== 0;
}
