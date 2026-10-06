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
import LiveStatsBar from '@/components/live-stats-bar'
import AiWidget from '@/components/ai-widget'
import AnnouncementsBanner from '@/components/announcements-banner'
import { Analytics } from '@vercel/analytics/next'
import { getUserSession } from '@/lib/data/user'
import { GeoProvider } from '@/lib/contexts/geo-context'
import { getFeatureFlags } from '@/lib/features'
import { getActiveAnnouncements } from '@/lib/data/announcements'
import { getAllLiveStats } from '@/lib/data/live-stats'
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
  const [session, flags, announcements, liveStats] = await Promise.all([
    getUserSession(),
    getFeatureFlags(),
    getActiveAnnouncements(),
    getAllLiveStats(),
  ])

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body>
        <GeoProvider>
          <Splash />
          <FloatingCapsule session={session} />
          {flags.announcements_enabled && announcements.length > 0 && (
            <AnnouncementsBanner announcements={announcements} />
          )}
          {children}
          <LiveStatsBar stats={liveStats} />
          <SiteFooter />
          <InstallPrompt />
          <ReviewReminder />
          {!session && <SignupPrompt />}
          {flags.ai_agent_enabled && <AiWidget />}
          <ScrollToTop />
          <Analytics />
        </GeoProvider>
      </body>
    </html>
  )
}
