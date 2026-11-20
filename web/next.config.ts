import withSerwistInit from '@serwist/next'
import type { NextConfig } from 'next'

// ─── External origins ───
const SUPABASE_HOST = 'npmpiivmdksdirrumbmt.supabase.co'
const CLOUDINARY_HOST = 'res.cloudinary.com'

// Build the Server Actions allowlist from the configured canonical URL and
// Vercel's deployment/production hosts. Never pin a stale deployment URL.
function toHostname(value: string | undefined): string | null {
  if (!value) return null
  try {
    const candidate = value.includes('://') ? value : `https://${value}`
    return new URL(candidate).host
  } catch {
    return null
  }
}

const serverActionOrigins = [
  process.env.NEXT_PUBLIC_SITE_URL,
  process.env.VERCEL_PROJECT_PRODUCTION_URL,
  process.env.VERCEL_URL,
  'localhost:3000',
]
  .map(toHostname)
  .filter((origin): origin is string => Boolean(origin))

// CSP moved to proxy.ts (per-request nonce)
const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: serverActionOrigins,
    },
  },
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  images: {
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      { protocol: 'https', hostname: CLOUDINARY_HOST, pathname: '/**' },
      {
        protocol: 'https',
        hostname: SUPABASE_HOST,
        pathname: '/storage/v1/object/public/**',
      },
      // TODO(pre-launch): remove the demo-only legacy hosts below.
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '0' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-site' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(self), geolocation=(self), payment=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains',
          },
          { key: 'Cross-Origin-Embedder-Policy', value: 'unsafe-none' },
          { key: 'Origin-Agent-Cluster', value: '?1' },
        ],
      },
    ]
  },
}

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
  reloadOnOnline: true,
  // Prevent caching session-specific pages and route payloads on next/link navigation.
  cacheOnNavigation: false,
  // Precache only the offline shell and the local brand assets required to render it.
  globPublicPatterns: [
    'offline.html',
    'eah-crown.webp',
    'eah-word.webp',
    'icon-192.png',
    'icon-512.png',
  ],
  register: false,
})

export default withSerwist(nextConfig)
