'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ComponentType } from 'react'
import { useGeo } from '@/lib/contexts/geo-context'
import {
  CloudFogIcon,
  CloudIcon,
  CloudLightningIcon,
  CloudRainIcon,
  CloudSnowIcon,
  CloudSunIcon,
  SunIcon,
} from './icons'
import styles from './floating-capsule.module.css'

// موقع شبين القناطر — fallback لو المستخدم رافض geolocation
const SHIBIN = { lat: 30.5541, lng: 31.0092 }
const CACHE_PREFIX = 'eah-weather-v2:'
const TTL_MS = 30 * 60 * 1000

type WeatherKind = 'sun' | 'cloud-sun' | 'cloud' | 'fog' | 'rain' | 'snow' | 'storm'

type WeatherCodeMeta = { label: string; icon: WeatherKind }

const CODES: Record<number, WeatherCodeMeta> = {
  0: { label: 'صافي', icon: 'sun' },
  1: { label: 'صافي أغلب الوقت', icon: 'cloud-sun' },
  2: { label: 'غائم جزئياً', icon: 'cloud-sun' },
  3: { label: 'غائم', icon: 'cloud' },
  45: { label: 'ضباب', icon: 'fog' },
  48: { label: 'ضباب متجمد', icon: 'fog' },
  51: { label: 'رش خفيف', icon: 'rain' },
  53: { label: 'رش', icon: 'rain' },
  55: { label: 'رش غزير', icon: 'rain' },
  61: { label: 'مطر خفيف', icon: 'rain' },
  63: { label: 'مطر', icon: 'rain' },
  65: { label: 'مطر غزير', icon: 'rain' },
  71: { label: 'ثلج خفيف', icon: 'snow' },
  73: { label: 'ثلج', icon: 'snow' },
  75: { label: 'ثلج غزير', icon: 'snow' },
  80: { label: 'زخات مطر', icon: 'rain' },
  81: { label: 'زخات غزيرة', icon: 'rain' },
  82: { label: 'زخات عنيفة', icon: 'rain' },
  95: { label: 'رعد', icon: 'storm' },
  96: { label: 'رعد + برد', icon: 'storm' },
  99: { label: 'رعد شديد', icon: 'storm' },
}

const WEATHER_ICONS: Record<WeatherKind, ComponentType<{ size?: number; className?: string }>> = {
  sun: SunIcon,
  'cloud-sun': CloudSunIcon,
  cloud: CloudIcon,
  fog: CloudFogIcon,
  rain: CloudRainIcon,
  snow: CloudSnowIcon,
  storm: CloudLightningIcon,
}

type W = { temp: number; icon: WeatherKind; label: string }

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
        const meta = CODES[code] ?? { label: '—', icon: 'cloud' }
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
  const WeatherGlyph = WEATHER_ICONS[w.icon] ?? CloudIcon

  return (
    <div className={styles.weather} aria-label={`الطقس: ${w.label} · ${w.temp}°`} title={w.label}>
      <span className={styles.weatherIcon} aria-hidden="true">
        <WeatherGlyph size={16} />
      </span>
      <span className={styles.weatherTemp}>{w.temp}°</span>
    </div>
  )
}
