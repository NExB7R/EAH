import withSerwistInit from '@serwist/next'
import type { NextConfig } from 'next'

// ─── دومينات خارجية ───
const SUPABASE_HOST = 'npmpiivmdksdirrumbmt.supabase.co'
const CLOUDINARY_HOST = 'res.cloudinary.com'

// CSP moved to proxy.ts (per-request nonce)

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['eah-sq.vercel.app', 'localhost:3000'],
    },
  },
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  images: {
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
      // مؤقت — صور تجريبية
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'scontent-iad3-2.xx.fbcdn.net', pathname: '/**' },
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
          // إضافات جديدة 2026
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
  cacheOnNavigation: true,
  register: false,
})

export default withSerwist(nextConfig)
