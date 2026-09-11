import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'EAH',
    short_name: 'EAH',
    description: 'اكتشف الأماكن والعروض المناسبة ليك في منطقتك.',
    start_url: '/',
    display: 'standalone',
    background_color: '#07060B',
    theme_color: '#07060B',
    lang: 'ar',
    dir: 'rtl',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  }
}
