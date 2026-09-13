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
    const interval = setInterval(fetch, 30000)
    return () => { active = false; clearInterval(interval) }
  }, [])

  return { count, loading }
}
