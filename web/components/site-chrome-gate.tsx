'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

// إخفاء عناصر الموقع العامة (فوتر + شريط إحصائيات) في صفحات الدخول
const HIDDEN_PREFIXES = ['/auth']

export default function SiteChromeGate({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const hidden = HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  if (hidden) return null
  return <>{children}</>
}
