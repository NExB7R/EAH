import type { Metadata, Viewport } from 'next'
import '@fontsource-variable/cairo'
import '@fontsource/tajawal/700.css'
import '@fontsource/tajawal/800.css'
import '@fontsource/tajawal/900.css'
import Splash from '@/components/splash'
import FloatingCapsule from '@/components/floating-capsule'
import InstallPrompt from '@/components/install-prompt'
import SignupPrompt from '@/components/signup-prompt'
import { getUserSession } from '@/lib/data/user'
import './globals.css'

export const metadata: Metadata = {
  title: 'EAH — اللي نفسك فيه ؟',
  description: 'منصة اكتشاف محلية مصرية — من قلب شبين القناطر',
  manifest: '/manifest.webmanifest',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#07020D',
  viewportFit: 'cover',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getUserSession()

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body>
        <Splash />
        <FloatingCapsule session={session} />
        {children}
        <InstallPrompt />
        {!session && <SignupPrompt />}
      </body>
    </html>
  )
}
