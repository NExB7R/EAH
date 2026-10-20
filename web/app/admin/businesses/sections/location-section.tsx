'use client'

import { useState } from 'react'
import { AlertIcon, MapPinIcon } from '@/components/icons'
import { useBusinessForm } from '../business-form-context'
import { SaveBar } from '../business-form-shared'
import styles from '../business-form.module.css'

export default function LocationSection() {
  const ctx = useBusinessForm()
  const existing = ctx.business.location

  const [lat, setLat] = useState(existing ? existing.lat.toFixed(6) : '')
  const [lng, setLng] = useState(existing ? existing.lng.toFixed(6) : '')
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [preview, setPreview] = useState<{ lat: number; lng: number } | null>(
    existing ? { lat: existing.lat, lng: existing.lng } : null,
  )

  const applyCoords = (latStr: string, lngStr: string) => {
    setLat(latStr)
    setLng(lngStr)
    const la = parseFloat(latStr)
    const ln = parseFloat(lngStr)
    if (Number.isFinite(la) && Number.isFinite(ln)) {
      setPreview({ lat: la, lng: ln })
    } else {
      setPreview(null)
    }
  }

  const captureLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeoError('المتصفح ما بيدعمش تحديد الموقع')
      return
    }
    setGeoError(null)
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        applyCoords(pos.coords.latitude.toFixed(6), pos.coords.longitude.toFixed(6))
        setGeoLoading(false)
      },
      (err) => {
        setGeoLoading(false)
        if (err.code === err.PERMISSION_DENIED) setGeoError('لازم تسمح للمتصفح بالوصول للموقع')
        else if (err.code === err.POSITION_UNAVAILABLE) setGeoError('مش قادر أحدد موقعك — جرب تاني')
        else if (err.code === err.TIMEOUT) setGeoError('انتهت المهلة — جرب تاني')
        else setGeoError('حصل خطأ — جرب تاني')
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    )
  }

  const mapSrc = preview
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${preview.lng - 0.005}%2C${preview.lat - 0.005}%2C${preview.lng + 0.005}%2C${preview.lat + 0.005}&layer=mapnik&marker=${preview.lat}%2C${preview.lng}`
    : null

  return (
    <form id="location-form" className={styles.sections}>
      <div className={styles.field}>
        <button
          type="button"
          onClick={captureLocation}
          disabled={geoLoading}
          className={styles.presetBtn}
        >
          <MapPinIcon size={14} /> {geoLoading ? 'بيحدد موقعك…' : 'استخدم موقعي الحالي'}
        </button>
        {geoError && (
          <span className={styles.hint} style={{ color: '#FCA5A5', marginTop: 6 }}>
            <AlertIcon size={12} /> {geoError}
          </span>
        )}
        <span className={styles.hint}>
          لو إنت واقف في المكان — دوس الزر، هنلتقط الموقع تلقائياً
        </span>
      </div>
      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label className={styles.label}>Latitude</label>
          <input
            name="latitude"
            value={lat}
            onChange={(e) => applyCoords(e.target.value, lng)}
            className={styles.input}
            dir="ltr"
            placeholder="30.123456"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Longitude</label>
          <input
            name="longitude"
            value={lng}
            onChange={(e) => applyCoords(lat, e.target.value)}
            className={styles.input}
            dir="ltr"
            placeholder="31.123456"
          />
        </div>
      </div>
      {mapSrc && (
        <div className={styles.field}>
          <iframe
            src={mapSrc}
            width="100%"
            height="300"
            style={{ border: '1px solid rgba(157,78,221,0.2)', borderRadius: 8 }}
            loading="lazy"
            title="معاينة الموقع"
          />
        </div>
      )}
      <div className={styles.field}>
        <label className={styles.label}>العنوان التفصيلي</label>
        <input
          name="address_text"
          defaultValue={ctx.addressText}
          className={styles.input}
          dir="rtl"
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Google Maps URL</label>
        <input
          name="map_url"
          defaultValue={ctx.business.map_url ?? ''}
          className={styles.input}
          dir="ltr"
        />
      </div>
      <SaveBar
        onClick={ctx.saveLocation}
        pending={ctx.pending}
        saved={ctx.savedSection === 'location'}
      />
    </form>
  )
}
