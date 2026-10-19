import { NextResponse } from 'next/server'

// ═══════════════════════════════════════════════════════════
// EAH — Cron auth (fail-closed)
// - secret missing → 500 (never skip)
// - wrong/missing Bearer → 401
// - returns null if OK
// ═══════════════════════════════════════════════════════════

export function verifyCron(req: Request): Response | null {
  const secret = process.env.CRON_SECRET
  if (!secret || secret.length < 16) {
    return NextResponse.json({ error: 'cron secret not configured' }, { status: 500 })
  }
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  return null
}
