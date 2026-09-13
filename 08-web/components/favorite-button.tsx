'use client'
import { useEffect, useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase-browser'
import './favorite-button.css'

export default function FavoriteButton({ businessId, size = 'md' }: { businessId: string; size?: 'sm' | 'md' }) {
  const [active, setActive] = useState(false)
  const [loading, setLoading] = useState(true)
  const [pending, start] = useTransition()

  useEffect(() => {
    const supabase = createClient()
    let m = true
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !m) { setLoading(false); return }
      const { data } = await supabase
        .from('favorites').select('id').eq('user_id', user.id).eq('business_id', businessId).maybeSingle()
      if (m) { setActive(!!data); setLoading(false) }
    })()
    return () => { m = false }
  }, [businessId])

  function toggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (loading) return

    start(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth'; return }

      if (active) {
        await supabase.from('favorites').delete().eq('user_id', user.id).eq('business_id', businessId)
        setActive(false)
      } else {
        await supabase.from('favorites').insert({ user_id: user.id, business_id: businessId })
        setActive(true)
      }
    })
  }

  return (
    <button
      type="button"
      className={`fav-btn fav-btn--${size} ${active ? 'is-active' : ''}`}
      onClick={toggle}
      disabled={loading || pending}
      aria-label={active ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
      title={active ? 'في المفضلة' : 'أضف للمفضلة'}
    >
      {active ? '❤️' : '🤍'}
    </button>
  )
}
