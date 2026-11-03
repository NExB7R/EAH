'use client'

import { useEffect } from 'react'

function createUuid(): string | null {
  try {
    if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
    const bytes = crypto.getRandomValues(new Uint8Array(16))
    bytes[6] = (bytes[6]! & 0x0f) | 0x40
    bytes[8] = (bytes[8]! & 0x3f) | 0x80
    const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, '0'))
    return [
      hex.slice(0, 4).join(''),
      hex.slice(4, 6).join(''),
      hex.slice(6, 8).join(''),
      hex.slice(8, 10).join(''),
      hex.slice(10, 16).join(''),
    ].join('-')
  } catch {
    return null
  }
}

/**
 * Anonymous, session-scoped page-view signal.
 * No account ID, raw IP, or long-lived visitor identifier is stored.
 */
export default function BusinessViewTracker({ businessId }: { businessId: string }) {
  useEffect(() => {
    if (!businessId) return

    const viewedKey = `eah:business-viewed:${businessId}`
    try {
      if (sessionStorage.getItem(viewedKey)) return

      const getSessionUuid = (key: string): string | null => {
        const existing = sessionStorage.getItem(key)
        if (existing) return existing
        const created = createUuid()
        if (created) sessionStorage.setItem(key, created)
        return created
      }

      // Same random visitor key across tabs for the current UTC day; the
      // session id remains tab-scoped. This limits multi-tab view inflation
      // without creating a long-lived cross-day browsing identifier.
      const day = new Date().toISOString().slice(0, 10)
      const visitorKey = 'eah:daily-visitor'
      let visitorId: string | null = null
      try {
        const stored = localStorage.getItem(visitorKey)
        if (stored) {
          const parsed = JSON.parse(stored) as { day?: string; id?: string }
          if (parsed.day === day && parsed.id) visitorId = parsed.id
        }
        if (!visitorId) {
          visitorId = createUuid()
          if (visitorId) localStorage.setItem(visitorKey, JSON.stringify({ day, id: visitorId }))
        }
      } catch {
        visitorId = getSessionUuid('eah:visitor-id')
      }
      const sessionId = getSessionUuid('eah:session-id')
      if (!visitorId || !sessionId) return

      // Set before sending so React Strict Mode and rapid navigation cannot
      // issue a duplicate request in the same tab/session.
      sessionStorage.setItem(viewedKey, '1')

      void fetch('/api/track-business-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, visitorId, sessionId }),
        keepalive: true,
      }).then((response) => {
        if (!response.ok) sessionStorage.removeItem(viewedKey)
      }).catch(() => {
        try {
          sessionStorage.removeItem(viewedKey)
        } catch {
          // Storage may have been disabled after the request.
        }
      })
    } catch {
      // Private browsing/storage restrictions must never break the business page.
    }
  }, [businessId])

  return null
}
