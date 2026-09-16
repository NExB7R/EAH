'use client'
import { useEffect, useRef } from 'react'
import './business-map.css'

type Props = {
  lat: number
  lng: number
  name: string
  area?: string
  address?: string
}

const AREA_COORDS: Record<string, { lat: number; lng: number }> = {
  'شبين القناطر': { lat: 30.3144, lng: 31.3212 },
  'القلج': { lat: 30.3225, lng: 31.3603 },
  'أبو زعبل': { lat: 30.2933, lng: 31.3700 },
  'الجبل الأصفر': { lat: 30.2850, lng: 31.3450 },
  'كفر بطا': { lat: 30.3350, lng: 31.2850 },
  'نوى': { lat: 30.3600, lng: 31.2900 },
  'طحا': { lat: 30.3450, lng: 31.3050 },
  'منشأة الكرام': { lat: 30.3300, lng: 31.3250 },
}

export function resolveCoords(
  lat: number | null | undefined,
  lng: number | null | undefined,
  area: string | undefined,
): { lat: number; lng: number; exact: boolean } | null {
  if (lat != null && lng != null) return { lat, lng, exact: true }
  if (area && AREA_COORDS[area]) return { ...AREA_COORDS[area], exact: false }
  return null
}

export default function BusinessMap({ lat, lng, name, area, address }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return
    let cancelled = false

    void (async () => {
      const L = (await import('leaflet')).default
      if (cancelled || !mapRef.current) return

      const map = L.map(mapRef.current, {
        center: [lat, lng],
        zoom: 16,
        zoomControl: true,
        attributionControl: false,
        scrollWheelZoom: false,
      })

      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          attribution: '© OpenStreetMap · © CARTO',
          subdomains: 'abcd',
          maxZoom: 20,
        },
      ).addTo(map)

      const icon = L.divIcon({
        className: 'bmap-pin',
        html: '<div class="bmap-pin__inner">👑</div>',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      })

      L.marker([lat, lng], { icon }).addTo(map)

      mapInstance.current = map
    })()

    return () => {
      cancelled = true
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [lat, lng])

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`

  return (
    <section className="bmap" aria-label={`موقع ${name} على الخريطة`}>
      <header className="bmap__head">
        <h2 className="bmap__title">📍 الموقع على الخريطة</h2>
        {address && <p className="bmap__addr">{address}{area ? ` — ${area}` : ''}</p>}
      </header>
      <div ref={mapRef} className="bmap__canvas" />
      <div className="bmap__foot">
        <span className="bmap__coords" dir="ltr">{lat.toFixed(5)}, {lng.toFixed(5)}</span>
        <a href={mapsUrl} target="_blank" rel="noreferrer" className="bmap__nav">
          🧭 افتح في Google Maps
        </a>
      </div>
    </section>
  )
}
