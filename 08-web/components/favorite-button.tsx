'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import './favorite-button.css'

export default function FavoriteButton({
  businessId,
  size = 'md',
}: {
  businessId: string
  size?: 'sm' | 'md'
}) {
  const [active, setActive] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [busy, setBusy] = useState(false)

  // Mount + load favorite state
  useEffect(() => {
    setMounted(true)
    const supabase = createClient()
    let alive = true

    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user || !alive) return

      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('business_id', businessId)
        .maybeSingle()

      if (alive) setActive(!!data)
    })()

    return () => {
      alive = false
    }
  }, [businessId])

  async function toggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (busy || !mounted) return

    setBusy(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/auth'
        return
      }

      if (active) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('business_id', businessId)
        setActive(false)
      } else {
        await supabase
          .from('favorites')
          .insert({ user_id: user.id, business_id: businessId })
        setActive(true)
      }
    } finally {
      setBusy(false)
    }
  }

  // ⚠️ Hydration-safe: خلال SSR وأول render، disabled=false دايماً
  const isDisabled = mounted && busy

  return (
    <button
      type="button"
      className={`fav-btn fav-btn--${size} ${active ? 'is-active' : ''}`}
      onClick={toggle}
      disabled={isDisabled}
      aria-label={active ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
      title={active ? 'في المفضلة' : 'أضف للمفضلة'}
    >
      {active ? '❤️' : '🤍'}
    </button>
  )
}
