import type { Metadata, Viewport } from 'next'
import '@fontsource-variable/cairo'
import '@fontsource/great-vibes'
import '@fontsource/tajawal/700.css'
import '@fontsource/tajawal/800.css'
import '@fontsource/tajawal/900.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'EAH — اللي نفسك فيه ؟',
  description: 'منصة اكتشاف محلية مصرية — من قلب شبين القناطر',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#07020D',
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  )
}
