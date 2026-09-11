'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

function getSessionId() {
  const key = 'eah_session_id'
  const existing = window.sessionStorage.getItem(key)
  if (existing) return existing
  const value = crypto.randomUUID()
  window.sessionStorage.setItem(key, value)
  return value
}

export default function EahAdSlot({ slotKey }: { slotKey: string }) {
  const [ad, setAd] = useState<any>(null)

  useEffect(() => {
    const supabase = createClient()
    const sessionId = getSessionId()
    const path = window.location.pathname

    void supabase.rpc('get_active_ad', {
      p_slot_key: slotKey,
      p_path: path,
      p_visitor_id: null,
      p_session_id: sessionId,
    }).then(({ data }) => {
      const creative = data?.[0]
      if (!creative) return
      setAd(creative)
      void supabase.rpc('record_ad_event', {
        p_creative_id: creative.creative_id,
        p_event_type: 'impression',
        p_visitor_id: null,
        p_session_id: sessionId,
        p_path: path,
      })
    })
  }, [slotKey])

  if (!ad) return null

  async function trackAndGo() {
    const supabase = createClient()
    const sessionId = window.sessionStorage.getItem('eah_session_id')
    await supabase.rpc('record_ad_event', {
      p_creative_id: ad.creative_id,
      p_event_type: 'click',
      p_visitor_id: null,
      p_session_id: sessionId,
      p_path: window.location.pathname,
    })
    window.location.assign(ad.destination_url)
  }

  return (
    <aside aria-label="إعلان" style={{ margin: '18px 0', padding: 12, border: '1px solid rgba(168,85,247,.18)', borderRadius: 18, background: 'rgba(168,85,247,.05)' }}>
      <div style={{ fontSize: 11, opacity: .55, marginBottom: 8 }}>إعلان</div>
      <button type="button" onClick={trackAndGo} style={{ display: 'grid', gridTemplateColumns: ad.image_url ? 'minmax(0, 180px) 1fr' : '1fr', width: '100%', gap: 14, textAlign: 'start', background: 'transparent', color: 'inherit', border: 0, cursor: 'pointer', padding: 0 }}>
        {ad.image_url && <img src={ad.image_url} alt={ad.alt_text || ad.headline} loading="lazy" style={{ width: '100%', aspectRatio: '16/8', objectFit: 'cover', borderRadius: 12 }} />}
        <span style={{ display: 'grid', gap: 5, alignContent: 'center' }}><strong>{ad.headline}</strong>{ad.body && <span style={{ opacity: .72, lineHeight: 1.6 }}>{ad.body}</span>}{ad.cta_text && <span style={{ fontWeight: 800, color: '#c4b5fd' }}>{ad.cta_text} →</span>}</span>
      </button>
    </aside>
  )
}
