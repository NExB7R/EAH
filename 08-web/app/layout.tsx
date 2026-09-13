import './globals.css'
import './theme.css'
import './design-system.css'
import '../components/eah-studio-pro.css'
import '../components/eah-admin.css'
import '@puckeditor/core/puck.css'
import type { Metadata } from 'next'
import { Cairo, Cairo_Play, Dancing_Script } from 'next/font/google'
import RegisterSW from '@/components/register-sw'
import PageViewTracker from '@/components/page-view-tracker'
import ScrollIconsBackground from '@/components/scroll-icons-background'
import OnboardingOverlay from '@/components/onboarding-overlay'
import PWAInstallPrompt from '@/components/pwa-install-prompt'
import StreakBadge from '@/components/streak-badge'
import StreakMount from '@/components/streak-mount'
import '@/components/streak-onboarding.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

const cairo = Cairo({
  subsets: ['arabic'],
  weight: ['400', '700', '900'],
  display: 'swap',
  variable: '--font-cairo',
})

const cairoPlay = Cairo_Play({
  subsets: ['arabic'],
  weight: ['400', '700', '900'],
  display: 'swap',
  variable: '--font-cairo-play',
})

const signature = Dancing_Script({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-signature',
})

export const metadata: Metadata = {
  title: { default: 'EAH | اللي نفسك فيه ؟', template: '%s | EAH' },
  description:
    'EAH منصة اكتشاف محلية تبدأ من شبين القناطر: مطاعم، صيدليات، توصيل وعروض مناسبة ليك.',
  metadataBase: new URL(siteUrl),
  alternates: { canonical: '/' },
  openGraph: {
    title: 'EAH | اللي نفسك فيه ؟',
    description: 'اكتشف اللي مناسب ليك حوالينك.',
    type: 'website',
    locale: 'ar_EG',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${cairoPlay.variable} ${signature.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ScrollIconsBackground />
        <PageViewTracker />
        {children}
        <RegisterSW />
            <OnboardingOverlay />
        <PWAInstallPrompt />
        <StreakBadge />
            <StreakMount />
      </body>
    </html>
  )
}
