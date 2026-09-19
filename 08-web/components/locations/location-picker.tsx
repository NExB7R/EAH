'use client'
import { useState } from 'react'
import type { SavedLocation } from '@/lib/locations'

type Props = {
  locations: SavedLocation[]
  onPick: (loc: SavedLocation | { latitude: number; longitude: number; label: string }) => void
  compact?: boolean
}

export default function LocationPicker({ locations, onPick, compact = false }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const detect = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('المتصفح مش بيدعم تحديد الموقع'); return
    }
    setLoading(true); setError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false)
        onPick({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          label: 'موقعي دلوقتي',
        })
      },
      () => { setLoading(false); setError('معرفناش نلاقي موقعك — اسمح بالوصول للموقع') },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }

  return (
    <div className={`lp ${compact ? 'lp--compact' : ''}`}>
      {locations.length > 0 && (
        <>
          <p className="lp__label">مواقعك المحفوظة</p>
          <ul className="lp__list">
            {locations.map((loc) => (
              <li key={loc.id}>
                <button type="button" className="lp__item" onClick={() => onPick(loc)}>
                  <span className="lp__item-icon">📍</span>
                  <span className="lp__item-label">{loc.label ?? 'موقع محفوظ'}</span>
                  {loc.is_primary && <span className="lp__item-badge">الأساسي</span>}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <button type="button" className="lp__detect" onClick={detect} disabled={loading}>
        {loading ? '...' : '📍 استخدم موقعي دلوقتي'}
      </button>

      {error && <p className="lp__error">{error}</p>}
    </div>
  )
}
