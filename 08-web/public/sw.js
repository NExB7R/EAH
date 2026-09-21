/* ═══════════════════════════════════════════════════════════════
   EAH Service Worker v2 (2026)
   Strategy:
   - App shell: stale-while-revalidate
   - Static assets (_next/static, fonts, images): cache-first, forever
   - Public pages: network-first with cache fallback
   - API: network-only (never cache authed data)
   - Offline fallback: serve /offline page for HTML navigations
   ═══════════════════════════════════════════════════════════════ */

const VERSION = 'eah-v3-2026-09'
const SHELL_CACHE = `${VERSION}-shell`
const STATIC_CACHE = `${VERSION}-static`
const IMAGE_CACHE = `${VERSION}-images`
const PAGE_CACHE = `${VERSION}-pages`

// نُبقي أول زيارة مخففة جدًا — الباقي cache-on-demand
// صفحات احتياطية تظهر أوفلاين
const OFFLINE_FALLBACKS = {
  '/explore': '/offline',
  '/offers': '/offline',
  '/trends': '/offline',
  '/new': '/offline',
  '/featured': '/offline',
  '/projects': '/offline',
  '/account': '/offline',
}

const PRE_CACHE = [
  '/',
  '/offline',
  '/manifest.webmanifest',
  '/crown-192.png',
]

// ═══════════════════════════════════════════════════════════════
// Install: pre-cache shell → activate immediately
// ═══════════════════════════════════════════════════════════════
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE)
      // add each — don't fail if one fails
      await Promise.all(
        PRE_CACHE.map((url) =>
          cache.add(url).catch(() => {
            /* silent */
          })
        )
      )
      await self.skipWaiting()
    })()
  )
})

// ═══════════════════════════════════════════════════════════════
// Activate: clean old caches
// ═══════════════════════════════════════════════════════════════
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys
          .filter((k) => !k.startsWith(VERSION))
          .map((k) => caches.delete(k))
      )
      await self.clients.claim()
    })()
  )
})

// ═══════════════════════════════════════════════════════════════
// Fetch routing
// ═══════════════════════════════════════════════════════════════
self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return

  const url = new URL(req.url)

  // Same-origin only for pages/assets
  if (url.origin !== self.location.origin) {
    // external requests: pass through
    return
  }

  // ═══ API: network-only ═══
  if (url.pathname.startsWith('/api/')) {
    return
  }

  // ═══ Next.js static assets: cache-first, immutable ═══
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(req).then((hit) => {
        if (hit) return hit
        return fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone()
            caches.open(STATIC_CACHE).then((c) => c.put(req, copy))
          }
          return res
        })
      })
    )
    return
  }

  // ═══ Images: cache-first with size cap ═══
  if (
    req.destination === 'image' ||
    /\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico)$/i.test(url.pathname)
  ) {
    event.respondWith(
      caches.match(req).then((hit) => {
        if (hit) return hit
        return fetch(req)
          .then((res) => {
            if (res.ok && res.status === 200) {
              const copy = res.clone()
              caches.open(IMAGE_CACHE).then((c) => c.put(req, copy))
            }
            return res
          })
          .catch(() => caches.match('/icon-192.png'))
      })
    )
    return
  }

  // ═══ HTML navigations: network-first, offline fallback ═══
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req)
          if (fresh.ok) {
            const copy = fresh.clone()
            caches.open(PAGE_CACHE).then((c) => c.put(req, copy))
          }
          return fresh
        } catch {
          // offline
          const cached = await caches.match(req)
          if (cached) return cached
          const offline = await caches.match('/offline')
          if (offline) return offline
          return new Response('Offline', { status: 503, statusText: 'Offline' })
        }
      })()
    )
    return
  }

  // ═══ Everything else: network with cache fallback ═══
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  )
})

// ═══════════════════════════════════════════════════════════════
// Message: skipWaiting + clear caches on demand
// ═══════════════════════════════════════════════════════════════
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
  if (event.data?.type === 'CLEAR_CACHES') {
    caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)))
  }
})

// ═══════════════════════════════════════════════════════════════
// Web Push
// ═══════════════════════════════════════════════════════════════
self.addEventListener('push', (event) => {
  let payload = {}
  try {
    payload = event.data ? event.data.json() : {}
  } catch {
    payload = { title: 'EAH', body: event.data?.text?.() ?? '' }
  }

  const title = payload.title ?? 'EAH'
  const options = {
    body: payload.body ?? '',
    icon: payload.icon ?? '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: payload.url ?? '/' },
    tag: payload.tag ?? 'eah-default',
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((list) => {
      for (const c of list) {
        if (c.url.includes(url) && 'focus' in c) return c.focus()
      }
      if (self.clients.openWindow) return self.clients.openWindow(url)
    })
  )
})
