'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

// ═══════════════════════════════════════════════════════════
// EAH — Geo Provider
// يقرأ موقع المستخدم مرة واحدة + يوفره لكل الكاردات
// ═══════════════════════════════════════════════════════════

const KEY = 'eah-user-location-v2'
const TTL_MS = 60 * 60 * 1000 // ساعة

export type UserLocation = { lat: number; lng: number }

export type GeoState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'granted'; location: UserLocation }
  | { status: 'denied' }
  | { status: 'unsupported' }

type GeoContextValue = GeoState & {
  request: () => void
}

const GeoContext = createContext<GeoContextValue>({
  status: 'idle',
  request: () => {},
})

function readCache(): UserLocation | null {
  try {
    const raw = localStorage.getItem(KEY)
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
    localStorage.setItem(KEY, JSON.stringify({ ...loc, at: Date.now() }))
  } catch {
    /* ignore */
  }
}

export function GeoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GeoState>({ status: 'idle' })

  const doRequest = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setState({ status: 'unsupported' })
      return
    }

    setState({ status: 'loading' })

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        writeCache(loc)
        setState({ status: 'granted', location: loc })
      },
      () => setState({ status: 'denied' }),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: TTL_MS },
    )
  }

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      await Promise.resolve()
      if (cancelled) return

      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        setState({ status: 'unsupported' })
        return
      }

      const cached = readCache()
      if (cached) {
        setState({ status: 'granted', location: cached })
        return
      }

      if (navigator.permissions) {
        try {
          const perm = await navigator.permissions.query({ name: 'geolocation' })
          if (cancelled) return
          if (perm.state === 'denied') {
            setState({ status: 'denied' })
            return
          }
          if (perm.state === 'granted') {
            doRequest()
            return
          }
        } catch {
          /* ignore */
        }
      }

      setState({ status: 'idle' })
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <GeoContext.Provider value={{ ...state, request: doRequest }}>{children}</GeoContext.Provider>
  )
}

export function useGeo(): GeoContextValue {
  return useContext(GeoContext)
}
