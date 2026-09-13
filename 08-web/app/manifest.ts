import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'EAH — اللى نفسك فيه ؟',
    short_name: 'EAH',
    description: 'منصة اكتشاف المطاعم والصيدليات والتوصيل في شبين القناطر',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#07060B',
    theme_color: '#A855F7',
    lang: 'ar',
    dir: 'rtl',
    categories: ['food', 'lifestyle', 'shopping'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
