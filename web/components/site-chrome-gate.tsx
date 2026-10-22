'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

const HIDDEN_PREFIXES = ['/auth', '/admin', '/merchant']

export default function SiteChromeGate({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const hidden = HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  if (hidden) return null
  return <>{children}</>
}
