'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { haversineKm, formatDistance, SHIBIN_CENTER, isValidCoords } from '@/lib/geo'

type Biz = {
  slug: string
  name: string
  type: string
  area: string | null
  latitude: number | null
  longitude: number | null
  is_open: boolean
}

const TYPE_LABEL: Record<string, string> = {
  restaurant: 'مطعم', pharmacy: 'صيدلية',
  supermarket: 'ماركت', delivery_office: 'توصيل',
}

export default function NearMeClient({ businesses }: { businesses: Biz[] }) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'denied' | 'unsupported' | 'ok'>('idle')

  const ask = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('unsupported'); return
    }
    setStatus('loading')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setStatus('ok')
      },
      () => setStatus('denied'),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    )
  }

  useEffect(() => { ask() }, [])

  const sorted = useMemo(() => {
    const valid = businesses.filter((b) => isValidCoords(b.latitude, b.longitude))
    const center = coords ?? SHIBIN_CENTER
    return valid
      .map((b) => ({ ...b, dist: haversineKm(center, { lat: b.latitude!, lng: b.longitude! }) }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 30)
  }, [businesses, coords])

  if (status === 'denied' || status === 'unsupported') {
    return (
      <div className="nm-empty">
        <p className="nm-msg">
          {status === 'denied' ? 'مش مسموح بالموقع، بس عادي — بنوريك الأقرب من شبين'
            : 'المتصفح مش بيدعم تحديد الموقع، بنوريك الأقرب من شبين'}
        </p>
        <ul className="nm-list">
          {sorted.map((b) => (
            <li key={b.slug} className="nm-item">
              <Link href={`/businesses/${b.slug}`} className="nm-link">
                <div className="nm-name">{b.name}</div>
                <div className="nm-meta">
                  <span className="nm-type">{TYPE_LABEL[b.type] ?? b.type}</span>
                  {b.area && <span>· {b.area}</span>}
                  <span className={`nm-open ${b.is_open ? 'on' : 'off'}`}>{b.is_open ? 'فاتح' : 'مقفول'}</span>
                </div>
                <div className="nm-dist">{formatDistance(b.dist)}</div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="nm-wrap">
      {status === 'loading' && <div className="nm-loading">بندور على موقعك...</div>}
      <ul className="nm-list">
        {sorted.map((b) => (
          <li key={b.slug} className="nm-item">
            <Link href={`/businesses/${b.slug}`} className="nm-link">
              <div className="nm-name">{b.name}</div>
              <div className="nm-meta">
                <span className="nm-type">{TYPE_LABEL[b.type] ?? b.type}</span>
                {b.area && <span>· {b.area}</span>}
                <span className={`nm-open ${b.is_open ? 'on' : 'off'}`}>{b.is_open ? 'فاتح' : 'مقفول'}</span>
              </div>
              <div className="nm-dist">{formatDistance(b.dist)}</div>
            </Link>
          </li>
        ))}
      </ul>
      {status === 'idle' && (
        <button type="button" className="nm-btn" onClick={ask}>حدد موقعي</button>
      )}
    </div>
  )
}
