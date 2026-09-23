'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export function useUnreadCount() {
  const [count, setCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    let active = true

    async function fetch() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { if (active) { setCount(0); setLoading(false) } return }
        const { count: c } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .is('read_at', null)
        if (active) { setCount(c ?? 0); setLoading(false) }
      } catch {
        if (active) setLoading(false)
      }
    }

    fetch()

    // فقط نحدّث لما الصفحة visible (توفير bandwidth)
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') fetch()
    }, 60000)

    const onVisible = () => {
      if (document.visibilityState === 'visible') fetch()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      active = false
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  return { count, loading }
}
