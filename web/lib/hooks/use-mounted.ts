'use client'

import { useEffect, useState } from 'react'

// ═══════════════════════════════════════════════════════════
// useMounted — يعمل false على server + أول render على client
// ═══════════════════════════════════════════════════════════
// ⚠️ مهم: بنستخدم useState+useEffect (مش useSyncExternalStore)
// السبب: useSyncExternalStore بيستخدم getSnapshot على client
// أثناء hydration → false/true mismatch → React #418
// ═══════════════════════════════════════════════════════════

export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: mount detection requires post-hydration setState
    setMounted(true)
  }, [])

  return mounted
}

// ─── للاستخدام مع قيم من المتصفح ───
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(query)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: sync with external MediaQueryList
    setMatches(mql.matches)

    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}
