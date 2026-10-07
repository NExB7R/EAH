'use client'

import { useEffect, useMemo, useState } from 'react'
import { useGeo } from '@/lib/contexts/geo-context'
import styles from './floating-capsule.module.css'

// موقع شبين القناطر — fallback لو المستخدم رافض geolocation
const SHIBIN = { lat: 30.5541, lng: 31.0092 }
const CACHE_PREFIX = 'eah-weather-v1:'
const TTL_MS = 30 * 60 * 1000

const CODES: Record<number, { label: string; icon: string }> = {
  0: { label: 'صافي', icon: '☀️' },
  1: { label: 'صافي أغلب الوقت', icon: '🌤️' },
  2: { label: 'غائم جزئياً', icon: '⛅' },
  3: { label: 'غائم', icon: '☁️' },
  45: { label: 'ضباب', icon: '🌫️' },
  48: { label: 'ضباب متجمد', icon: '🌫️' },
  51: { label: 'رش خفيف', icon: '🌦️' },
  53: { label: 'رش', icon: '🌦️' },
  55: { label: 'رش غزير', icon: '🌧️' },
  61: { label: 'مطر خفيف', icon: '🌧️' },
  63: { label: 'مطر', icon: '🌧️' },
  65: { label: 'مطر غزير', icon: '🌧️' },
  71: { label: 'ثلج خفيف', icon: '🌨️' },
  73: { label: 'ثلج', icon: '🌨️' },
  75: { label: 'ثلج غزير', icon: '❄️' },
  80: { label: 'زخات مطر', icon: '🌦️' },
  81: { label: 'زخات غزيرة', icon: '🌧️' },
  82: { label: 'زخات عنيفة', icon: '⛈️' },
  95: { label: 'رعد', icon: '⛈️' },
  96: { label: 'رعد + برد', icon: '⛈️' },
  99: { label: 'رعد شديد', icon: '⛈️' },
}

type W = { temp: number; icon: string; label: string }

function cacheKey(lat: number, lng: number): string {
  return `${CACHE_PREFIX}${lat.toFixed(2)}_${lng.toFixed(2)}`
}

function readCache(lat: number, lng: number): W | null {
  try {
    const raw = localStorage.getItem(cacheKey(lat, lng))
    if (!raw) return null
    const data = JSON.parse(raw) as W & { at: number }
    if (Date.now() - data.at > TTL_MS) return null
    return { temp: data.temp, icon: data.icon, label: data.label }
  } catch {
    return null
  }
}

function writeCache(lat: number, lng: number, w: W) {
  try {
    localStorage.setItem(cacheKey(lat, lng), JSON.stringify({ ...w, at: Date.now() }))
  } catch {
    /* ignore */
  }
}

export default function HeaderWeather() {
  const geo = useGeo()
  const [fetched, setFetched] = useState<W | null>(null)

  const lat = geo.status === 'granted' ? geo.location.lat : SHIBIN.lat
  const lng = geo.status === 'granted' ? geo.location.lng : SHIBIN.lng

  // الكاش يُقرأ كـ derived — مفيش setState متزامن في effect
  const cached = useMemo(() => readCache(lat, lng), [lat, lng])
  const w = fetched ?? cached

  useEffect(() => {
    // لو عندنا كاش صالح → مانجيبش من الشبكة
    if (readCache(lat, lng)) return

    let cancelled = false
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code`

    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return
        const temp = data.current?.temperature_2m
        const code = data.current?.weather_code
        if (typeof temp !== 'number' || typeof code !== 'number') return
        const meta = CODES[code] ?? { label: '—', icon: '🌡️' }
        const next: W = { temp: Math.round(temp), icon: meta.icon, label: meta.label }
        writeCache(lat, lng, next)
        setFetched(next)
      })
      .catch(() => {
        /* silent */
      })

    return () => {
      cancelled = true
    }
  }, [lat, lng])

  if (!w) return null

  return (
    <div className={styles.weather} aria-label={`الطقس: ${w.label} · ${w.temp}°`} title={w.label}>
      <span className={styles.weatherIcon} aria-hidden>
        {w.icon}
      </span>
      <span className={styles.weatherTemp}>{w.temp}°</span>
    </div>
  )
}
