import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'EAH اللى نفسك فيه ؟',
    short_name: 'EAH',
    description: 'منصة اكتشاف محلية مصرية — من قلب شبين القناطر',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#07020D',
    theme_color: '#07020D',
    lang: 'ar',
    dir: 'rtl',
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
  }
}
