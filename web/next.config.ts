import type { NextConfig } from 'next'

// ─── دومينات خارجية ───
const SUPABASE_HOST = 'npmpiivmdksdirrumbmt.supabase.co'
const CLOUDINARY_HOST = 'res.cloudinary.com'

const isDev = process.env.NODE_ENV === 'development'

// ═══════════════════════════════════════════════════════════
// CSP — 2026 (بدون Nonce، بدون Trusted Types)
// - default-src 'self' — أساس آمن
// - script-src-elem للـ <script src> — granular
// - script-src-attr للـ inline handlers — صفر
// - style-src-elem للـ CSS — granular
// - report-uri → /api/csp-report (تسجيل في Vercel logs)
// ═══════════════════════════════════════════════════════════

const csp = [
  "default-src 'self'",

  // Scripts — عناصر <script>
  isDev
    ? "script-src-elem 'self' 'unsafe-eval' 'unsafe-inline' https://challenges.cloudflare.com"
    : "script-src-elem 'self' 'unsafe-inline' https://challenges.cloudflare.com",
  // Scripts — inline handlers (onclick=...) — ممنوع
  "script-src-attr 'none'",

  // Styles — عناصر <style> و <link>
  "style-src-elem 'self' 'unsafe-inline'",
  // Styles — inline (style="") — مسموح بـ React
  "style-src-attr 'unsafe-inline'",

  // Images
  `img-src 'self' data: blob: https://${CLOUDINARY_HOST} https://${SUPABASE_HOST} https://images.unsplash.com https://scontent-iad3-2.xx.fbcdn.net`,

  // Network
  `connect-src 'self' https://${SUPABASE_HOST} wss://${SUPABASE_HOST} https://api.cloudinary.com https://challenges.cloudflare.com https://openrouter.ai`,

  // Fonts + Frames + Others
  "font-src 'self' data:",
  "frame-src 'self' https://challenges.cloudflare.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "manifest-src 'self'",
  "worker-src 'self' blob:",
  "media-src 'self'",
  'upgrade-insecure-requests',

  // Reporting (تقارير في Vercel logs)
  'report-uri /api/csp-report',
].join('; ')

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
          { key: 'Content-Security-Policy', value: csp },
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

export default nextConfig
