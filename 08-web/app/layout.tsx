import './globals.css'
import './theme.css'
import './design-system.css'
import '../components/eah-admin.css'
import type { Metadata } from 'next'
import { Cairo, Cairo_Play, Dancing_Script } from 'next/font/google'
import PageViewTracker from '@/components/page-view-tracker'
import ScrollIconsBackground from '@/components/scroll-icons-background'
import StickersLayer from '@/components/stickers-layer'
import SplashScreen from '@/components/splash-screen'
import AnimReady from '@/components/anim-ready'
import OnboardingOverlay from '@/components/onboarding-overlay'
import ServiceWorkerRegister from '@/components/sw-register'
import NetworkStatus from '@/components/network-status'
import OfflineQueueMount from '@/components/offline-queue-mount'
import InstallAppButton from '@/components/install-app-button'
import SmartBot from '@/components/smart-bot'
import CookieConsent from '@/components/cookie-consent'
import '@/components/install-pwa-button.css'
import '@/components/install-app-button.css'
import '@/components/share-button.css'
import '@/components/offline-queue-mount.css'

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

// EAH_BUILD = 1789585536.2520845
export const metadata: Metadata = {
  title: {
    default: 'EAH — اللي نفسك فيه ؟',
    template: '%s | EAH',
  },
  description:
    'EAH منصة اكتشاف محلية تبدأ من شبين القناطر: مطاعم، صيدليات، سوبرماركت، توصيل — اختيارات مظبوطة على مزاجك.',
  metadataBase: new URL(siteUrl),
  applicationName: 'EAH',
  generator: 'Next.js',
  icons: {
    icon: [
      { url: '/eah-crown.webp', type: 'image/webp' },
      { url: '/eah-crown.webp', sizes: '192x192', type: 'image/webp' },
      { url: '/eah-crown.webp', sizes: '512x512', type: 'image/webp' },
    ],
    apple: [{ url: '/eah-crown.webp', sizes: '180x180', type: 'image/webp' }],
    shortcut: '/eah-crown.webp',
  },
  manifest: '/manifest.webmanifest',
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
    title: 'EAH — اللي نفسك فيه ؟',
    description: 'اكتشف اللي مناسب ليك حوالينك — مطاعم، صيدليات، ماركت، توصيل.',
    type: 'website',
    locale: 'ar_EG',
    siteName: 'EAH',
    url: siteUrl,
    images: [
      {
        url: '/icon-512.png',
        width: 512,
        height: 512,
        alt: 'EAH',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EAH — اللي نفسك فيه ؟',
    description: 'اكتشف اللي مناسب ليك حوالينك.',
    images: ['/icon-512.png'],
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
        <SplashScreen />
        <StickersLayer />
        <ScrollIconsBackground />
        <PageViewTracker />
        <AnimReady />
        {children}
        <OnboardingOverlay />
        <ServiceWorkerRegister />
        <NetworkStatus />
        <OfflineQueueMount />
        <InstallAppButton />
        <SmartBot />
        <CookieConsent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  '@id': `${siteUrl}/#org`,
                  name: 'EAH',
                  alternateName: 'اللي نفسك فيه',
                  url: siteUrl,
                  logo: `${siteUrl}/icon-512.png`,
                  areaServed: {
                    '@type': 'City',
                    name: 'Shibin El-Qanater',
                    containedInPlace: { '@type': 'Country', name: 'Egypt' },
                  },
                  sameAs: ['https://facebook.com/eah.eg'],
                },
                {
                  '@type': 'WebSite',
                  '@id': `${siteUrl}/#website`,
                  url: siteUrl,
                  name: 'EAH',
                  inLanguage: 'ar-EG',
                  publisher: { '@id': `${siteUrl}/#org` },
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: {
                      '@type': 'EntryPoint',
                      urlTemplate: `${siteUrl}/search?q={search_term_string}`,
                    },
                    'query-input': 'required name=search_term_string',
                  },
                },
              ],
            }),
          }}
        />
      </body>
    </html>
  )
}
