import type { Metadata, Viewport } from 'next'
import '@fontsource-variable/cairo'
import '@fontsource/great-vibes'
import '@fontsource/tajawal/700.css'
import '@fontsource/tajawal/800.css'
import '@fontsource/tajawal/900.css'
import FloatingCapsule from '@/components/floating-capsule'
import InstallPrompt from '@/components/install-prompt'
import ReviewReminder from '@/components/review-reminder'
import SignupPrompt from '@/components/signup-prompt'
import ScrollToTop from '@/components/scroll-to-top'
import SiteFooter from '@/components/site-footer'
import { getUserSession } from '@/lib/data/user'
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getUserSession()

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body>
        <FloatingCapsule session={session} />
        {children}
        <SiteFooter />
        <InstallPrompt />
        <ReviewReminder />
        {!session && <SignupPrompt />}
        <ScrollToTop />
      </body>
    </html>
  )
}
