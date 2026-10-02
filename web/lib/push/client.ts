'use client'

// ═══════════════════════════════════════════════════════════
// EAH — Push Notifications (Client)
// ═══════════════════════════════════════════════════════════

export function isPushSupported(): boolean {
  if (typeof window === 'undefined') return false
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

async function registerSW(): Promise<ServiceWorkerRegistration> {
  const existing = await navigator.serviceWorker.getRegistration()
  if (existing) return existing
  return navigator.serviceWorker.register('/sw.js', { scope: '/' })
}

export type PushStatus = 'unsupported' | 'default' | 'granted' | 'denied'

export async function getPushStatus(): Promise<PushStatus> {
  if (!isPushSupported()) return 'unsupported'
  return Notification.permission as PushStatus
}

export async function subscribeToPush(): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isPushSupported()) return { ok: false, error: 'المتصفح لا يدعم الإشعارات' }

  const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  if (!vapid) return { ok: false, error: 'إعدادات الإشعارات ناقصة' }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return { ok: false, error: 'تم رفض الإذن' }

  try {
    const reg = await registerSW()
    await navigator.serviceWorker.ready

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapid) as BufferSource,
    })

    const json = sub.toJSON()
    const res = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: json.endpoint,
        keys: json.keys,
      }),
    })

    if (!res.ok) return { ok: false, error: 'فشل الحفظ' }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}

export async function unsubscribeFromPush(): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isPushSupported()) return { ok: false, error: 'غير مدعوم' }

  try {
    const reg = await navigator.serviceWorker.getRegistration()
    if (!reg) return { ok: true }

    const sub = await reg.pushManager.getSubscription()
    if (!sub) return { ok: true }

    const endpoint = sub.endpoint
    await sub.unsubscribe()

    await fetch('/api/push/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint }),
    })

    return { ok: true }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}
