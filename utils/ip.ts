import crypto from 'crypto';

export function hashIP(ip: string): string {
  // Use a secret key for hashing to prevent reverse engineering
  const secret = process.env.IP_HASH_SECRET || 'your-secret-key';
  return crypto
    .createHmac('sha256', secret)
    .update(ip)
    .digest('hex');
}