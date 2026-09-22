'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { enqueue } from '@/lib/offline-queue'
import { IcHeart } from '@/components/eah-icons'
import './favorite-button.css'

type FavoriteState = { userId: string | null; ids: Set<string> }
let favoriteStatePromise: Promise<FavoriteState> | null = null

function loadFavoriteState(): Promise<FavoriteState> {
  if (favoriteStatePromise) return favoriteStatePromise

  favoriteStatePromise = (async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { userId: null, ids: new Set<string>() }

    const { data } = await supabase
      .from('favorites')
      .select('business_id')
      .eq('user_id', user.id)
    return {
      userId: user.id,
      ids: new Set((data ?? []).map((row) => row.business_id as string)),
    }
  })().catch(() => ({ userId: null, ids: new Set<string>() }))

  return favoriteStatePromise
}

export default function FavoriteButton({
  businessId,
  size = 'md',
}: {
  businessId: string
  size?: 'sm' | 'md'
}) {
  const [active, setActive] = useState(false)
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [needsAuth, setNeedsAuth] = useState(false)

  useEffect(() => {
    let alive = true
    void loadFavoriteState().then((state) => {
      if (!alive) return
      setNeedsAuth(!state.userId)
      setActive(state.ids.has(businessId))
      setReady(true)
    })
    return () => { alive = false }
  }, [businessId])

  async function toggle(event: React.MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
    if (busy || !ready) return

    if (needsAuth) {
      const next = `${window.location.pathname}${window.location.search}`
      window.location.href = `/auth?next=${encodeURIComponent(next)}`
      return
    }

    const nextActive = !active
    setActive(nextActive)
    setBusy(true)

    try {
      const state = await loadFavoriteState()
      if (!state.userId) throw new Error('unauthorized')

      if (!navigator.onLine) {
        await enqueue({
          type: 'favorite',
          endpoint: '/api/favorites',
          method: nextActive ? 'POST' : 'DELETE',
          payload: { business_id: businessId, action: nextActive ? 'add' : 'remove' },
        })
        window.dispatchEvent(new CustomEvent('eah:queue-updated'))
      } else {
        const supabase = createClient()
        const result = nextActive
          ? await supabase.from('favorites').upsert(
              { user_id: state.userId, business_id: businessId },
              { onConflict: 'user_id,business_id' },
            )
          : await supabase.from('favorites')
              .delete()
              .eq('user_id', state.userId)
              .eq('business_id', businessId)
        if (result.error) throw result.error
      }

      if (nextActive) state.ids.add(businessId)
      else state.ids.delete(businessId)
    } catch {
      setActive(!nextActive)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      className={`fav-btn fav-btn--${size}${active ? ' is-active' : ''}`}
      onClick={toggle}
      disabled={busy}
      aria-label={active ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
      aria-pressed={active}
      title={needsAuth ? 'سجّل عشان تضيف للمفضلة' : active ? 'في المفضلة' : 'أضف للمفضلة'}
    >
      <IcHeart />
    </button>
  )
}
