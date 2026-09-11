import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'EAH',
    short_name: 'EAH',
    description: 'اكتشف الأماكن والعروض المناسبة ليك في منطقتك.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0B0D10',
    theme_color: '#0B0D10',
    lang: 'ar',
    dir: 'rtl',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
  }
}
