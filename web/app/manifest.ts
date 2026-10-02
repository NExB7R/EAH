import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'EAH اللى نفسك فيه ؟',
    short_name: 'EAH',
    description: 'منصة اكتشاف محلية مصرية — من قلب شبين القناطر',
    start_url: '/?utm_source=pwa',
    scope: '/',
    display: 'standalone',
    display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
    orientation: 'portrait-primary',
    background_color: '#07020D',
    theme_color: '#07020D',
    lang: 'ar',
    dir: 'rtl',
    categories: ['food', 'shopping', 'lifestyle', 'local'],
    prefer_related_applications: false,
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'اكتشف',
        short_name: 'اكتشف',
        description: 'اكتشف الأنشطة حواليك',
        url: '/explore',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'العروض',
        short_name: 'عروض',
        description: 'أحدث العروض',
        url: '/offers',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'قريب منك',
        short_name: 'قريب',
        description: 'الأنشطة القريبة',
        url: '/nearby',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'حسابي',
        short_name: 'حسابي',
        description: 'النقاط والمفضلات',
        url: '/account',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
    ],
  }
}
