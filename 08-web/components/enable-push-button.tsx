'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import './enable-push-button.css'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)))
}

export default function EnablePushButton() {
  const [status, setStatus] = useState<'idle' | 'unsupported' | 'denied' | 'enabled' | 'loading'>('loading')

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setStatus('unsupported'); return
    }
    if (Notification.permission === 'denied') { setStatus('denied'); return }
    if (Notification.permission === 'granted') {
      // تحقق إن فيه subscription
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setStatus(sub ? 'enabled' : 'idle')
        })
      })
      return
    }
    setStatus('idle')
  }, [])

  async function enable() {
    setStatus('loading')
    try {
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') { setStatus('denied'); return }

      const reg = await navigator.serviceWorker.ready
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) { setStatus('idle'); return }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })

      const json: any = sub.toJSON()
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setStatus('idle'); return }

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
      })
      if (res.ok) setStatus('enabled')
      else setStatus('idle')
    } catch {
      setStatus('idle')
    }
  }

  async function disable() {
    setStatus('loading')
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
        await sub.unsubscribe()
      }
      setStatus('idle')
    } catch {
      setStatus('idle')
    }
  }

  if (status === 'loading') return null
  if (status === 'unsupported') return (
    <div className="epb epb--off"><span>📵</span> إشعارات Push مش مدعومة في المتصفح</div>
  )
  if (status === 'denied') return (
    <div className="epb epb--denied"><span>🚫</span> الإشعارات محظورة — فعّلها من إعدادات المتصفح</div>
  )
  if (status === 'enabled') return (
    <div className="epb epb--on">
      <span>🔔</span>
      <div className="epb__body">
        <strong>الإشعارات مفعّلة</strong>
        <span>هتوصلك تنبيهات على موبايلك</span>
      </div>
      <button onClick={disable} className="epb__btn epb__btn--ghost">إيقاف</button>
    </div>
  )

  return (
    <div className="epb">
      <span className="epb__emoji">🔔</span>
      <div className="epb__body">
        <strong>فعّل الإشعارات</strong>
        <span>هتوصلك تنبيهات فورية على موبايلك</span>
      </div>
      <button onClick={enable} className="epb__btn">تفعيل</button>
    </div>
  )
}
