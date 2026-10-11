import { createHash } from 'crypto'
import { headers } from 'next/headers'
import { getTrustedClientIp } from './client-ip'

// ═══════════════════════════════════════════════════════════
// EAH — IP Hashing (privacy-preserving)
//   • مش بنخزّن IP الخام
//   • hash + salt من .env.local
//   • 16 حرف (SHA-256 → hex → slice)
// ═══════════════════════════════════════════════════════════

export async function getHashedIp(): Promise<string | null> {
  const salt = process.env.EAH_VISITOR_SALT
  if (!salt) return null

  const h = await headers()
  const ip = getTrustedClientIp(h)
  if (ip === 'unknown') return null

  const hash = createHash('sha256').update(`${salt}:${ip}`).digest('hex')
  return hash.slice(0, 32)
}
