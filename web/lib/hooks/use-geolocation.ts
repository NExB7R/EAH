'use client'

import { useEffect, useState } from 'react'

// ═══════════════════════════════════════════════════════════
// EAH — useGeolocation
// يقرأ موقع المستخدم من sessionStorage أولاً (cache 10 دقايق)
// ═══════════════════════════════════════════════════════════

const KEY = 'eah-user-location'
const TTL_MS = 10 * 60 * 1000

export type UserLocation = { lat: number; lng: number }

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'granted'; location: UserLocation }
  | { status: 'denied' }
  | { status: 'unsupported' }

function readCache(): UserLocation | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as { lat: number; lng: number; at: number }
    if (Date.now() - data.at > TTL_MS) return null
    return { lat: data.lat, lng: data.lng }
  } catch {
    return null
  }
}

function writeCache(loc: UserLocation) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ ...loc, at: Date.now() }))
  } catch {
    /* ignore */
  }
}

export function useGeolocation(): State {
  const [state, setState] = useState<State>({ status: 'idle' })

  useEffect(() => {
    let cancelled = false
    const update = (next: State) => {
      if (!cancelled) setState(next)
    }

    const run = async () => {
      // defer للسطر التالي عشان نتجنب setState-in-effect (react-hooks rule)
      await Promise.resolve()
      if (cancelled) return

      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        update({ status: 'unsupported' })
        return
      }

      const cached = readCache()
      if (cached) {
        update({ status: 'granted', location: cached })
        return
      }

      if (navigator.permissions) {
        try {
          const perm = await navigator.permissions.query({ name: 'geolocation' })
          if (cancelled) return
          if (perm.state === 'denied') {
            update({ status: 'denied' })
            return
          }
        } catch {
          /* ignore permissions API errors */
        }
      }

      update({ status: 'loading' })

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          writeCache(loc)
          update({ status: 'granted', location: loc })
        },
        () => update({ status: 'denied' }),
        { enableHighAccuracy: false, timeout: 8000, maximumAge: TTL_MS },
      )
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
