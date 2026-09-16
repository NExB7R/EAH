'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import type { Ad } from '@/lib/ads/types'
import './ad-slot.css'

type Props = { ad: Ad; href: string }

export default function AdSlot({ ad, href }: Props) {
  useEffect(() => {
    void (async () => {
      try {
        const supabase = createClient()
        await supabase.rpc('track_ad_event', { p_ad_id: ad.id, p_event: 'impression' })
      } catch { /* silent */ }
    })()
  }, [ad.id])

  async function onClick() {
    try {
      const supabase = createClient()
      await supabase.rpc('track_ad_event', { p_ad_id: ad.id, p_event: 'click' })
    } catch { /* silent */ }
  }

  const external = href.startsWith('http')

  const inner = (
    <div className="adslot__inner">
      <span className="adslot__badge">إعلان</span>
      {ad.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={ad.image_url} alt={ad.title} className="adslot__img" loading="lazy" />
      ) : (
        <div className="adslot__placeholder" />
      )}
      <div className="adslot__body">
        <h3 className="adslot__title">{ad.title}</h3>
        {ad.description && <p className="adslot__desc">{ad.description}</p>}
      </div>
    </div>
  )

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer sponsored" className="adslot" onClick={onClick}>
        {inner}
      </a>
    )
  }

  return (
    <Link href={href} className="adslot" onClick={onClick}>
      {inner}
    </Link>
  )
}
