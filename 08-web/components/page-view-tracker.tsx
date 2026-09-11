'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'

function getOrCreateId(key: string) {
  const existing = window.localStorage.getItem(key)
  if (existing) return existing
  const id = crypto.randomUUID()
  window.localStorage.setItem(key, id)
  return id
}

export default function PageViewTracker({ businessId }: { businessId?: string }) {
  useEffect(() => {
    let cancelled = false
    const visitorId = getOrCreateId('eah_visitor_id')
    const sessionKey = 'eah_session_id'
    let sessionId = sessionStorage.getItem(sessionKey)
    if (!sessionId) {
      sessionId = crypto.randomUUID()
      sessionStorage.setItem(sessionKey, sessionId)
    }

    const supabase = createClient()
    const path = window.location.pathname
    const deviceType = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
    const referrer = document.referrer || null

    void supabase.rpc('record_page_view', {
      p_path: path,
      p_visitor_id: visitorId,
      p_session_id: sessionId,
      p_business_id: businessId ?? null,
      p_referrer: referrer,
      p_device_type: deviceType,
    })

    const heartbeat = window.setInterval(() => {
      if (cancelled) return
      void supabase.rpc('heartbeat_page_session', {
        p_session_id: sessionId,
        p_path: window.location.pathname,
        p_business_id: businessId ?? null,
      })
    }, 45_000)

    return () => {
      cancelled = true
      window.clearInterval(heartbeat)
    }
  }, [businessId])

  return null
}
