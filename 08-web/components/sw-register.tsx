'use client'
import { useEffect } from 'react'

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return
    if (process.env.NODE_ENV !== 'production' && !window.location.hostname.includes('vercel.app')) return

    navigator.serviceWorker.register('/sw.js').catch(() => {})
  }, [])
  return null
}
