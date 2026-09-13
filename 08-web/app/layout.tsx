import './globals.css'
import './theme.css'
import './design-system.css'
import '../components/eah-admin.css'
import type { Metadata } from 'next'
import { Cairo, Cairo_Play, Dancing_Script } from 'next/font/google'
import PageViewTracker from '@/components/page-view-tracker'
import ScrollIconsBackground from '@/components/scroll-icons-background'
import AnimReady from '@/components/anim-ready'
import SidePanelToggle from '@/components/side-panel-toggle'
import OnboardingOverlay from '@/components/onboarding-overlay'
import StreakBadge from '@/components/streak-badge'
import StreakMount from '@/components/streak-mount'
import ServiceWorkerRegister from '@/components/sw-register'
import InstallBanner from '@/components/install-banner'
import '@/components/install-pwa-button.css'
import '@/components/install-app-button.css'
import '@/components/share-button.css'
import '@/components/verified-badge.css'
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
  formatDetection: { telephone: false, email: false, address: false },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'EAH',
    'mobile-web-app-capable': 'yes',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: 'EAH | اللي نفسك فيه ؟',
    description: 'اكتشف اللي مناسب ليك حوالينك — مطاعم، صيدليات، ماركت، توصيل.',
    type: 'website',
    locale: 'ar_EG',
    siteName: 'EAH',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EAH | اللي نفسك فيه ؟',
    description: 'اكتشف اللي مناسب ليك حوالينك.',
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
        <AnimReady />
        <SidePanelToggle />
        {children}
        <OnboardingOverlay />
        <StreakBadge />
        <StreakMount />
        <ServiceWorkerRegister />
        <InstallBanner />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'EAH',
              alternateName: 'اللي نفسك فيه',
              url: 'https://eah-sq.vercel.app',
              logo: 'https://eah-sq.vercel.app/icon-512.png',
              areaServed: {
                '@type': 'City',
                name: 'Shibin El-Qanater',
                containedInPlace: { '@type': 'Country', name: 'Egypt' },
              },
              sameAs: ['https://facebook.com/eah.eg'],
            }),
          }}
        />
      </body>
    </html>
  )
}
