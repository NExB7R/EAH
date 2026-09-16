import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'EAH — اللي نفسك فيه ؟',
    short_name: 'EAH',
    description:
      'اكتشف المطاعم والصيدليات والماركت والتوصيل في شبين القناطر والقرى حواليها.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#07060b',
    theme_color: '#0a0714',
    lang: 'ar',
    dir: 'rtl',
    categories: ['food', 'shopping', 'lifestyle', 'local'],
    icons: [
      { src: '/eah-crown.webp', sizes: 'any', type: 'image/webp', purpose: 'any' },
      { src: '/eah-crown.webp', sizes: '192x192', type: 'image/webp', purpose: 'any' },
      { src: '/eah-crown.webp', sizes: '512x512', type: 'image/webp', purpose: 'any' },
      { src: '/eah-crown.webp', sizes: '512x512', type: 'image/webp', purpose: 'maskable' },
      { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/webp' },
    ],
    shortcuts: [
      {
        name: 'اكتشف',
        short_name: 'اكتشف',
        description: 'استكشف الأماكن',
        url: '/explore',
        icons: [{ src: '/eah-crown.webp', sizes: '192x192' }],
      },
      {
        name: 'العروض',
        short_name: 'عروض',
        description: 'أحدث العروض',
        url: '/offers',
        icons: [{ src: '/eah-crown.webp', sizes: '192x192' }],
      },
      {
        name: 'حسابي',
        short_name: 'حسابي',
        url: '/account',
        icons: [{ src: '/eah-crown.webp', sizes: '192x192' }],
      },
    ],
  }
}
