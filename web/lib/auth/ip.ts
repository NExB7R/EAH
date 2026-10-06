import { createHash } from 'crypto'
import { headers } from 'next/headers'

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
  const forwarded = h.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || h.get('x-real-ip')
  if (!ip) return null

  const hash = createHash('sha256').update(`${salt}:${ip}`).digest('hex')
  return hash.slice(0, 32)
}
