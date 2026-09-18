'use client'
import { useEffect } from 'react'

type MetricName = 'LCP' | 'INP' | 'CLS' | 'FCP' | 'TTFB'

export default function WebVitals() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (process.env.NODE_ENV !== 'production') return

    const send = (name: MetricName, value: number, id: string) => {
      try {
        const url = '/api/vitals'
        const body = JSON.stringify({ name, value: Math.round(value), id })
        if (navigator.sendBeacon) {
          navigator.sendBeacon(url, body)
        } else {
          fetch(url, { method: 'POST', body, keepalive: true }).catch(() => {})
        }
      } catch { /* silent */ }
    }

    let lcpValue = 0
    let clsValue = 0
    let fcpValue = 0

    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const last = entries[entries.length - 1] as PerformanceEntry
        lcpValue = last.startTime
        send('LCP', lcpValue, 'lcp')
      }).observe({ type: 'largest-contentful-paint', buffered: true })
    } catch {}

    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) clsValue += entry.value
        }
        send('CLS', clsValue * 1000, 'cls')
      }).observe({ type: 'layout-shift', buffered: true })
    } catch {}

    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        if (entries.length > 0) {
          fcpValue = entries[0].startTime
          send('FCP', fcpValue, 'fcp')
        }
      }).observe({ type: 'paint', buffered: true })
    } catch {}

    try {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (nav?.responseStart) {
        send('TTFB', nav.responseStart, 'ttfb')
      }
    } catch {}
  }, [])

  return null
}
