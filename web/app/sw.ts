/// <reference lib="webworker" />

import { defaultCache } from '@serwist/next/worker'
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'
import { Serwist, CacheFirst, NetworkFirst, StaleWhileRevalidate, ExpirationPlugin } from 'serwist'

// ═══════════════════════════════════════════════════════════
// EAH — Service Worker (Serwist v9)
// 2026 — Cache + Push + Background Sync
// ═══════════════════════════════════════════════════════════

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  runtimeCaching: [
    // HTML pages — StaleWhileRevalidate (فوري + تحديث خلفي)
    {
      matcher: ({ request }) => request.destination === 'document',
      handler: new StaleWhileRevalidate({
        cacheName: 'eah-pages',
        plugins: [new ExpirationPlugin({ maxAgeSeconds: 86400, maxEntries: 100 })],
      }),
    },
    // CSS / JS / Fonts — CacheFirst
    {
      matcher: ({ request }) => ['style', 'script', 'font', 'worker'].includes(request.destination),
      handler: new CacheFirst({
        cacheName: 'eah-assets',
        plugins: [new ExpirationPlugin({ maxAgeSeconds: 2592000, maxEntries: 200 })],
      }),
    },
    // Images — CacheFirst
    {
      matcher: ({ request }) => request.destination === 'image',
      handler: new CacheFirst({
        cacheName: 'eah-images',
        plugins: [new ExpirationPlugin({ maxAgeSeconds: 2592000, maxEntries: 300 })],
      }),
    },
    // API — NetworkFirst (فشل → cache قديم)
    {
      matcher: ({ url }) => url.pathname.startsWith('/api/'),
      handler: new NetworkFirst({
        cacheName: 'eah-api',
        networkTimeoutSeconds: 5,
        plugins: [new ExpirationPlugin({ maxAgeSeconds: 3600, maxEntries: 100 })],
      }),
    },
    // بقية (default)
    ...defaultCache,
  ],
})

serwist.addEventListeners()

// ─── Push notifications ───
self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload: { title?: string; body?: string; icon?: string; tag?: string; url?: string } = {}
  try {
    payload = event.data.json()
  } catch {
    payload = { title: 'EAH', body: event.data.text() }
  }

  const title = payload.title || 'EAH'
  const options: NotificationOptions = {
    body: payload.body || '',
    icon: payload.icon || '/icon-192.png',
    badge: '/icon-192.png',
    tag: payload.tag || 'eah',
    data: { url: payload.url || '/' },
    requireInteraction: false,
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data as { url?: string } | undefined)?.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      return self.clients.openWindow(url)
    }),
  )
})

// ─── Background Sync ───
self.addEventListener('sync', (event) => {
  if (event.tag === 'eah-queue') {
    event.waitUntil(notifyClientsToFlush())
  }
})

async function notifyClientsToFlush(): Promise<void> {
  const clients = await self.clients.matchAll({ includeUncontrolled: true })
  for (const client of clients) {
    client.postMessage({ type: 'FLUSH_QUEUE' })
  }
}

// ─── Message handler ───
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
