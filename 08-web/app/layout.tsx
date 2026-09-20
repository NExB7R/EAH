import './globals.css'
import './social.css'
import './theme.css'
import './eah-ui.css'
import './design-system.css'
import '../components/eah-admin.css'
import type { Metadata, Viewport } from 'next'
import { Cairo, Cairo_Play, Dancing_Script } from 'next/font/google'
import PageViewTracker from '@/components/page-view-tracker'
import { ToastProvider } from '@/components/ui/toast'
import SplashScreen from '@/components/splash-screen'
import AmbientBg from '@/components/ambient-bg'
import '@/components/ambient-bg.css'
import AnimReady from '@/components/anim-ready'
import OnboardingOverlay from '@/components/onboarding-overlay'
import ServiceWorkerRegister from '@/components/sw-register'
import NetworkStatus from '@/components/network-status'
import OfflineQueueMount from '@/components/offline-queue-mount'
import InstallAppButton from '@/components/install-app-button'
import SmartBot from '@/components/smart-bot'
import CookieConsent from '@/components/cookie-consent'
import SyncStatus from '@/components/sync-status'
import WebVitals from '@/components/web-vitals'
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
  preload: true,
  adjustFontFallback: true,
})

const signature = Dancing_Script({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  variable: '--font-signature',
  preload: false,
})

const cairoPlay = Cairo_Play({
  subsets: ['arabic'],
  weight: ['800', '900'],
  display: 'swap',
  variable: '--font-cairo-play',
  preload: true,
  adjustFontFallback: true,
})

// EAH_BUILD = 1789585536.2520845
// VERSION_MARKER: v0.3.3

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#07060B' },
    { media: '(prefers-color-scheme: light)', color: '#07060B' },
  ],
}

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
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/crown-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/crown-512.webp', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/favicon.ico',
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
        url: '/crown-512.webp',
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
    images: ['/crown-512.webp'],
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
        <AmbientBg />
        <SplashScreen />
        <PageViewTracker />
        <AnimReady />
        <ToastProvider>{children}</ToastProvider>
        <OnboardingOverlay />
        <ServiceWorkerRegister />
        <NetworkStatus />
        <OfflineQueueMount />
        <InstallAppButton />
        <SmartBot />
        <CookieConsent />
        <SyncStatus />
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
                  logo: `${siteUrl}/crown-512.webp`,
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
              <WebVitals />
      </body>
    </html>
  )
}
