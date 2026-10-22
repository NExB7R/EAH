'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

// ═══════════════════════════════════════════════════════════
// EAH — Site Chrome Gate
//   scope="footer" → مخفي فقط في /auth — الفوتر في كل صفحة
//   scope="mobile" → مخفي في /auth /admin /merchant — الـ bottom bar
// ═══════════════════════════════════════════════════════════

const HIDDEN: Record<string, string[]> = {
  footer: ['/auth'],
  mobile: ['/auth', '/admin', '/merchant'],
}

type Props = {
  children: ReactNode
  scope?: 'footer' | 'mobile'
}

export default function SiteChromeGate({ children, scope = 'footer' }: Props) {
  const pathname = usePathname()
  const hidden = (HIDDEN[scope] ?? []).some((p) => pathname === p || pathname.startsWith(`${p}/`))
  if (hidden) return null
  return <>{children}</>
}
