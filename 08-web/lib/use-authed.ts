'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export function useAuthed(): boolean | null {
  const [authed, setAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let alive = true
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (alive) setAuthed(!!user)
    })()
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session?.user)
    })
    return () => { alive = false; sub.subscription.unsubscribe() }
  }, [])

  return authed
}
