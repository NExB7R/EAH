import '@fontsource-variable/cairo'
import '@fontsource-variable/dancing-script'
import './globals.css'
import './social.css'
import './theme.css'
import './eah-ui.css'
import './design-system.css'
import '../components/eah-admin.css'
import type { Metadata, Viewport } from 'next'
import PageViewTracker from '@/components/page-view-tracker'
import { ToastProvider } from '@/components/ui/toast'
import AmbientBg from '@/components/ambient-bg'
import BackToTop from '@/components/back-to-top'
import '@/components/ambient-bg.css'
import AnimReady from '@/components/anim-ready'
import OnboardingOverlay from '@/components/onboarding-overlay'
import ServiceWorkerRegister from '@/components/sw-register'
import NetworkStatus from '@/components/network-status'
import OfflineQueueMount from '@/components/offline-queue-mount'
import InstallAppButton from '@/components/install-app-button'
import CookieConsent from '@/components/cookie-consent'
import SyncStatus from '@/components/sync-status'
import WebVitals from '@/components/web-vitals'
import '@/components/install-pwa-button.css'
import '@/components/install-app-button.css'
import '@/components/share-button.css'
import '@/components/offline-queue-mount.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

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
    'EAH منصة اكتشاف محلية تبدأ من شبين القناطر: مطاعم، صيدليات، توصيل — اختيارات مظبوطة على مزاجك.',
  metadataBase: new URL(siteUrl),
  applicationName: 'EAH',
  generator: 'Next.js',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/crown-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/crown-512.webp', sizes: '512x512', type: 'image/webp' },
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
    description: 'اكتشف اللي مناسب ليك حوالينك — مطاعم، صيدليات، توصيل.',
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
      suppressHydrationWarning
    >
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('eah-welcome-seen-v1')){document.documentElement.classList.add('wg-seen')}}catch(e){}`,
          }}
        />
        <AmbientBg />
<PageViewTracker />
        <AnimReady />
        <ToastProvider>{children}</ToastProvider>
        <BackToTop />
        <OnboardingOverlay />
        <ServiceWorkerRegister />
        <NetworkStatus />
        <OfflineQueueMount />
        <InstallAppButton />
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
