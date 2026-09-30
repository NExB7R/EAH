'use client'

import { useSyncExternalStore } from 'react'

// ═══════════════════════════════════════════════════════════
// useMounted — بديل حديث لـ mounted pattern
// بدل: useState(false) + useEffect(() => setMounted(true))
// ═══════════════════════════════════════════════════════════
// بيرجع false في SSR و true في client بعد hydration
// بدون setState-in-effect → صفر cascading renders
// ═══════════════════════════════════════════════════════════

const emptySubscribe = () => () => {}

export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  )
}

// ─── للاستخدام مع قيم من المتصفح (مثل prefers-reduced-motion) ───
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', cb)
      return () => mql.removeEventListener('change', cb)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}
