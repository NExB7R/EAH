import type { NextConfig } from 'next'

// ─── دومينات خارجية ───
const SUPABASE_HOST = 'npmpiivmdksdirrumbmt.supabase.co'
const CLOUDINARY_HOST = 'res.cloudinary.com'

// ─── بيئة التطوير؟ ───
const isDev = process.env.NODE_ENV === 'development'

// ─── CSP ───
// production: script-src 'self' (صارم)
// dev: نضيف unsafe-eval + unsafe-inline (لـ HMR)
const csp = [
  "default-src 'self'",
  isDev
    ? "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://challenges.cloudflare.com"
    : "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://${CLOUDINARY_HOST} https://${SUPABASE_HOST} https://images.unsplash.com https://scontent-iad3-2.xx.fbcdn.net`,
  `connect-src 'self' https://${SUPABASE_HOST} wss://${SUPABASE_HOST} https://api.cloudinary.com https://challenges.cloudflare.com`,
  "font-src 'self' data:",
  "frame-src 'self' https://challenges.cloudflare.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ')

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: CLOUDINARY_HOST,
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: SUPABASE_HOST,
        pathname: '/storage/v1/object/public/**',
      },
      {
        // مؤقت — بيانات تجريبية
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        // مؤقت — صور تجريبية من فيسبوك
        protocol: 'https',
        hostname: 'scontent-iad3-2.xx.fbcdn.net',
        pathname: '/**',
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(self), geolocation=(self), payment=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains',
          },
        ],
      },
    ]
  },
}

export default nextConfig
