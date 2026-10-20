'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

// ═══════════════════════════════════════════════════════════
// EAH — Site Chrome Gate
// Hide public chrome (footer, live stats, floating capsule)
// on routes that have their own navigation:
//   - /auth/*  — auth flow
//   - /admin/* — admin dashboard (has sidebar)
//   - /merchant/* — merchant panel (has its own nav)
// ═══════════════════════════════════════════════════════════

const HIDDEN_PREFIXES = ['/auth', '/admin', '/merchant']

export default function SiteChromeGate({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const hidden = HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  if (hidden) return null
  return <>{children}</>
}
