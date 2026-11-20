export type RuntimeCacheRequest = {
  sameOrigin: boolean
  pathname: string
  destination: string
  headers: Pick<Headers, 'has'>
}

export function shouldUseNetworkOnly(request: RuntimeCacheRequest): boolean {
  if (!request.sameOrigin) return false

  return (
    request.destination === 'document' ||
    request.pathname === '/api' ||
    request.pathname.startsWith('/api/') ||
    request.pathname.startsWith('/_next/data/') ||
    request.headers.has('RSC') ||
    request.headers.has('Next-Router-Prefetch') ||
    request.headers.has('Next-Router-Segment-Prefetch')
  )
}

const PUBLIC_LOCAL_IMAGES = new Set([
  '/eah-crown.webp',
  '/eah-word.webp',
  '/icon-192.png',
  '/icon-512.png',
])

export function isCacheablePublicImageUrl(
  value: string,
  appOrigin: string,
  supabaseHost: string,
): boolean {
  try {
    const appUrl = new URL(appOrigin)
    const imageUrl = new URL(value, appUrl.origin)

    if (
      (imageUrl.protocol !== 'https:' && imageUrl.protocol !== 'http:') ||
      imageUrl.username ||
      imageUrl.password
    ) {
      return false
    }

    if (imageUrl.origin === appUrl.origin) {
      return !imageUrl.search && PUBLIC_LOCAL_IMAGES.has(imageUrl.pathname)
    }

    if (imageUrl.protocol !== 'https:' || imageUrl.port) return false

    if (
      imageUrl.hostname === 'res.cloudinary.com' &&
      imageUrl.pathname.includes('/image/upload/') &&
      !imageUrl.pathname.includes('/authenticated/')
    ) {
      return true
    }

    if (
      imageUrl.hostname === supabaseHost &&
      imageUrl.pathname.startsWith('/storage/v1/object/public/')
    ) {
      return true
    }

    return imageUrl.hostname === 'images.unsplash.com'
  } catch {
    return false
  }
}

export function resolveSafeNotificationUrl(value: unknown, appOrigin: string): string {
  let appUrl: URL
  try {
    appUrl = new URL(appOrigin)
  } catch {
    return '/'
  }

  const fallback = new URL('/', appUrl.origin).href
  if (typeof value !== 'string' || value.length === 0 || value.length > 2048) return fallback

  try {
    const target = new URL(value, appUrl.origin)
    if (
      target.origin !== appUrl.origin ||
      (target.protocol !== 'https:' && target.protocol !== 'http:') ||
      target.username ||
      target.password
    ) {
      return fallback
    }
    return target.href
  } catch {
    return fallback
  }
}
