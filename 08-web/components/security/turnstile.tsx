'use client'
import { useEffect, useRef } from 'react'

type Props = {
  siteKey?: string
  onVerify: (token: string) => void
  theme?: 'dark' | 'light' | 'auto'
}

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: any) => string
      reset: (id: string) => void
      remove: (id: string) => void
    }
  }
}

export default function Turnstile({ siteKey, onVerify, theme = 'dark' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<string | null>(null)
  const key = siteKey ?? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  useEffect(() => {
    if (!key || !ref.current) return

    const existing = document.querySelector('script[src*="challenges.cloudflare.com"]')
    if (!existing) {
      const s = document.createElement('script')
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
      s.async = true
      s.defer = true
      document.head.appendChild(s)
    }

    const tryRender = () => {
      if (!window.turnstile || !ref.current || widgetRef.current) return
      widgetRef.current = window.turnstile.render(ref.current, {
        sitekey: key,
        theme,
        callback: (token: string) => onVerify(token),
        'error-callback': () => onVerify(''),
        'expired-callback': () => onVerify(''),
      })
    }

    if (window.turnstile) tryRender()
    else {
      const t = setInterval(() => {
        if (window.turnstile) { clearInterval(t); tryRender() }
      }, 200)
      return () => clearInterval(t)
    }
  }, [key, theme, onVerify])

  if (!key) return null

  return <div ref={ref} className="turnstile-wrap" />
}
