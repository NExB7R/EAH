'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { enqueue } from '@/lib/offline-queue'
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
  const [needsAuth, setNeedsAuth] = useState(false)

  useEffect(() => {
    setMounted(true)
    const supabase = createClient()
    let alive = true
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!alive) return
      if (!user) {
        setNeedsAuth(true)
        return
      }
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('business_id', businessId)
        .maybeSingle()
      if (alive) setActive(!!data)
    })()
    return () => { alive = false }
  }, [businessId])

  async function toggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (busy || !mounted) return

    if (needsAuth) {
      // نودّي المستخدم للتسجيل
      const next = typeof window !== 'undefined' ? window.location.pathname : '/'
      window.location.href = `/auth?next=${encodeURIComponent(next)}`
      return
    }

    const willBeActive = !active
    setActive(willBeActive)
    setBusy(true)

    // Offline — enqueue
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      try {
        await enqueue({
          type: 'favorite',
          endpoint: '/api/favorites',
          method: willBeActive ? 'POST' : 'DELETE',
          payload: { business_id: businessId, action: willBeActive ? 'add' : 'remove' },
        })
        window.dispatchEvent(new CustomEvent('eah:queue-updated'))
      } catch {
        setActive(!willBeActive)
      } finally {
        setBusy(false)
      }
      return
    }

    // Online — direct
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setNeedsAuth(true)
        setActive(!willBeActive)
        return
      }
      if (willBeActive) {
        await supabase.from('favorites').insert({ user_id: user.id, business_id: businessId })
      } else {
        await supabase.from('favorites').delete().eq('user_id', user.id).eq('business_id', businessId)
      }
    } catch {
      await enqueue({
        type: 'favorite',
        endpoint: '/api/favorites',
        method: willBeActive ? 'POST' : 'DELETE',
        payload: { business_id: businessId, action: willBeActive ? 'add' : 'remove' },
      })
    } finally {
      setBusy(false)
    }
  }

  const isDisabled = mounted && busy

  return (
    <button
      type="button"
      className={'fav-btn fav-btn--' + size + (active ? ' is-active' : '')}
      onClick={toggle}
      disabled={isDisabled}
      aria-label={active ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
      title={needsAuth ? 'سجّل عشان تضيف للمفضلة' : active ? 'في المفضلة' : 'أضف للمفضلة'}
    >
      {active ? '' : '🤍'}
    </button>
  )
}
