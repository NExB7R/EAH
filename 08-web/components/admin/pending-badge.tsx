'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function PendingBadge({ initial = 0 }: { initial?: number }) {
  const [count, setCount] = useState(initial)

  useEffect(() => {
    let alive = true

    async function fetchCount() {
      try {
        const supabase = createClient()
        const { count: c } = await supabase
          .from('pending_changes')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')
        if (alive && typeof c === 'number') setCount(c)
      } catch { /* silent */ }
    }

    // اول fetch فوري
    void fetchCount()

    // polling كل 60 ثانية
    const t = setInterval(fetchCount, 60_000)

    // refresh فوري عند focus
    const onFocus = () => void fetchCount()
    window.addEventListener('focus', onFocus)

    return () => {
      alive = false
      clearInterval(t)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  if (count <= 0) return null
  return <span className="admin-sidebar__link-badge">{count}</span>
}
