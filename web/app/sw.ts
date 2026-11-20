/// <reference lib="webworker" />

import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'
import { CacheFirst, ExpirationPlugin, NetworkOnly, Serwist } from 'serwist'
import {
  isCacheablePublicImageUrl,
  resolveSafeNotificationUrl,
  shouldUseNetworkOnly,
} from '../lib/offline/service-worker-policy'

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

const LEGACY_CACHE_NAMES = new Set([
  'eah-pages',
  'eah-api',
  'eah-images',
  'eah-assets',
  'google-fonts-webfonts',
  'google-fonts-stylesheets',
  'static-font-assets',
  'static-image-assets',
  'next-static-js-assets',
  'next-image',
  'static-audio-assets',
  'static-video-assets',
  'static-js-assets',
  'static-style-assets',
  'next-data',
  'apis',
  'pages-rsc-prefetch',
  'pages-rsc',
  'pages',
  'static-data-assets',
  'others',
  'cross-origin',
])

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  runtimeCaching: [
    // Never serve session-specific HTML, APIs or React Server Component payloads from cache.
    {
      matcher: ({ request, url, sameOrigin }) =>
        shouldUseNetworkOnly({
          sameOrigin,
          pathname: url.pathname,
          destination: request.destination,
          headers: request.headers,
        }),
      handler: new NetworkOnly(),
    },
    // Immutable same-origin build assets are bounded by age and entry count.
    {
      matcher: ({ request, sameOrigin }) =>
        sameOrigin && ['style', 'script', 'font'].includes(request.destination),
      handler: new CacheFirst({
        cacheName: 'eah-assets-v2',
        plugins: [new ExpirationPlugin({ maxAgeSeconds: 2592000, maxEntries: 200 })],
      }),
    },
    // Cache only explicitly public images; signed/private storage URLs are excluded.
    {
      matcher: ({ request, url }) =>
        request.destination === 'image' &&
        isCacheablePublicImageUrl(
          url.href,
          self.location.origin,
          'npmpiivmdksdirrumbmt.supabase.co',
        ),
      handler: new CacheFirst({
        cacheName: 'eah-public-images-v2',
        plugins: [new ExpirationPlugin({ maxAgeSeconds: 2592000, maxEntries: 300 })],
      }),
    },
  ],
  fallbacks: {
    entries: [
      {
        url: '/offline.html',
        matcher: ({ request }) => request.destination === 'document',
      },
    ],
  },
})

// Remove cache buckets from previous workers. Several contained session-specific HTML,
// RSC payloads or API responses and must not survive this policy change.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => LEGACY_CACHE_NAMES.has(key)).map((key) => caches.delete(key)),
      ),
    ),
  )
})

serwist.addEventListeners()

self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload: { title?: string; body?: string; icon?: string; tag?: string; url?: string } = {}
  try {
    payload = event.data.json()
  } catch {
    payload = { title: 'EAH', body: event.data.text() }
  }

  const safeIcon = isCacheablePublicImageUrl(
    payload.icon || '/icon-192.png',
    self.location.origin,
    'npmpiivmdksdirrumbmt.supabase.co',
  )
    ? new URL(payload.icon || '/icon-192.png', self.location.origin).href
    : '/icon-192.png'

  const options: NotificationOptions = {
    body: payload.body || '',
    icon: safeIcon,
    badge: '/icon-192.png',
    tag: payload.tag || 'eah',
    data: { url: resolveSafeNotificationUrl(payload.url, self.location.origin) },
    requireInteraction: false,
  }

  event.waitUntil(self.registration.showNotification(payload.title || 'EAH', options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = resolveSafeNotificationUrl(
    (event.notification.data as { url?: unknown } | undefined)?.url,
    self.location.origin,
  )

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          await client.navigate(url)
          return client.focus()
        }
      }
      return self.clients.openWindow(url)
    }),
  )
})

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

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
