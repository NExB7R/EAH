import localFont from 'next/font/local'

// ═══════════════════════════════════════════════════════════
// EAH — Fonts (next/font/local)
// ═══════════════════════════════════════════════════════════

// Tajawal (display — hero + عناوين) — preload للـ LCP
export const tajawal = localFont({
  src: [
    { path: './fonts/tajawal-700.woff2', weight: '700', style: 'normal' },
    { path: './fonts/tajawal-800.woff2', weight: '800', style: 'normal' },
    { path: './fonts/tajawal-900.woff2', weight: '900', style: 'normal' },
  ],
  variable: '--font-tajawal',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
})

// Cairo (body — variable font)
export const cairo = localFont({
  src: './fonts/cairo-variable.woff2',
  variable: '--font-cairo',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
})

// Great Vibes (signature — ثانوي)
export const greatVibes = localFont({
  src: './fonts/great-vibes.woff2',
  variable: '--font-great-vibes',
  display: 'swap',
  preload: false,
  fallback: ['cursive'],
})
