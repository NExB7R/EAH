import type { Metadata, Viewport } from 'next'
import '@fontsource-variable/cairo'
import '@fontsource/great-vibes'
import '@fontsource/tajawal/700.css'
import '@fontsource/tajawal/800.css'
import '@fontsource/tajawal/900.css'
import Splash from '@/components/splash'
import FloatingCapsule from '@/components/floating-capsule'
import InstallPrompt from '@/components/install-prompt'
import ReviewReminder from '@/components/review-reminder'
import SignupPrompt from '@/components/signup-prompt'
import ScrollToTop from '@/components/scroll-to-top'
import SiteFooter from '@/components/site-footer'
import AiWidget from '@/components/ai-widget'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { getUserSession } from '@/lib/data/user'
import { getFeatureFlags } from '@/lib/features'
import './globals.css'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://eah-sq.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'EAH اللى نفسك فيه ؟',
    template: '%s | EAH',
  },
  description: 'منصة اكتشاف محلية مصرية — من قلب شبين القناطر',
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    url: SITE_URL,
    siteName: 'EAH',
    title: 'EAH اللى نفسك فيه ؟',
    description: 'منصة اكتشاف محلية مصرية — من قلب شبين القناطر',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EAH اللى نفسك فيه ؟',
    description: 'منصة اكتشاف محلية مصرية — من قلب شبين القناطر',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#07020D',
  viewportFit: 'cover',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [session, flags] = await Promise.all([getUserSession(), getFeatureFlags()])

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body>
        <Splash />
        <FloatingCapsule session={session} />
        {children}
        <SiteFooter />
        <InstallPrompt />
        <ReviewReminder />
        {!session && <SignupPrompt />}
        {flags.ai_agent_enabled && <AiWidget />}
        <ScrollToTop />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
