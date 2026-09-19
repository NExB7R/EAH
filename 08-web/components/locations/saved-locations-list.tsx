'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { SavedLocation } from '@/lib/locations'

export default function SavedLocationsList({ initial }: { initial: SavedLocation[] }) {
  const router = useRouter()
  const [locations, setLocations] = useState(initial)
  const [adding, setAdding] = useState(false)
  const [label, setLabel] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [coords, setCoords] = useState<{ latitude: number; longitude: number; accuracy?: number } | null>(null)

  const detect = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('مش بيدعم تحديد الموقع'); return
    }
    setLoading(true); setError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        })
        setLoading(false)
      },
      () => { setLoading(false); setError('اسمح بالوصول للموقع') },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const save = async (makePrimary: boolean) => {
    if (!coords) { setError('حدد موقعك الأول'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...coords,
          label: label.trim() || 'موقع',
          is_primary: makePrimary,
        }),
      })
      const data = await res.json()
      if (data.ok) {
        setAdding(false); setLabel(''); setCoords(null)
        router.refresh()
      } else setError(data.reason ?? 'فشل الحفظ')
    } catch { setError('فشل الحفظ') }
    setLoading(false)
  }

  const remove = async (id: string) => {
    if (!confirm('متأكد من الحذف؟')) return
    await fetch(`/api/locations?id=${id}`, { method: 'DELETE' })
    setLocations((prev) => prev.filter((l) => l.id !== id))
  }

  return (
    <div className="sl">
      {locations.length > 0 && (
        <ul className="sl__list">
          {locations.map((loc) => (
            <li key={loc.id} className="sl__item">
              <span className="sl__item-icon">📍</span>
              <div className="sl__item-body">
                <div className="sl__item-label">{loc.label ?? 'موقع'}</div>
                <div className="sl__item-coords">
                  {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                </div>
              </div>
              {loc.is_primary && <span className="sl__item-badge">الأساسي</span>}
              <button type="button" className="sl__item-del" onClick={() => remove(loc.id)} aria-label="حذف">×</button>
            </li>
          ))}
        </ul>
      )}

      {!adding ? (
        <button type="button" className="sl__add" onClick={() => setAdding(true)}>
          + أضف موقع جديد
        </button>
      ) : (
        <div className="sl__form">
          {!coords ? (
            <>
              <button type="button" className="sl__detect" onClick={detect} disabled={loading}>
                {loading ? '...' : '📍 استخدم موقعي دلوقتي'}
              </button>
              {error && <p className="sl__error">{error}</p>}
            </>
          ) : (
            <>
              <p className="sl__coords">✅ تم تحديد موقعك: {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}</p>
              <input
                className="sl__input"
                placeholder="اسم الموقع (البيت / الشغل ...)"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                maxLength={50}
              />
              <div className="sl__actions">
                <button type="button" className="sl__btn sl__btn--ghost" onClick={() => { setCoords(null); setAdding(false) }}>إلغاء</button>
                <button type="button" className="sl__btn" onClick={() => save(false)} disabled={loading}>حفظ</button>
                <button type="button" className="sl__btn sl__btn--primary" onClick={() => save(true)} disabled={loading}>حفظ كأساسي</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
