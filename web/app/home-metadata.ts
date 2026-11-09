import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://eah-sq.vercel.app'

export const homeMetadata: Metadata = {
  title: 'EAH — اللي نفسك فيه',
  description:
    'اكتشف أحسن المطاعم، الصيدليات، مكاتب التوصيل، والأنشطة المحلية في شبين القناطر والقرى حوالينها. تواصل مباشر، بدون وسيط، وبدون عمولة.',
  keywords: [
    'شبين القناطر',
    'أنشطة محلية',
    'مطاعم',
    'صيدليات',
    'توصيل',
    'EAH',
    'Egypt local discovery',
  ],
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    url: SITE_URL,
    siteName: 'EAH',
    title: 'EAH — اللي نفسك فيه',
    description:
      'اكتشف أحسن الأماكن في شبين القناطر. تواصل مباشر، بدون وسيط، وبدون عمولة.',
    images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: 'EAH' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EAH — اللي نفسك فيه',
    description: 'منصة اكتشاف محلية — شبين القناطر والقرى حوالينها',
    images: [`${SITE_URL}/twitter-image`],
  },
  alternates: {
    canonical: SITE_URL,
  },
}

export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'EAH',
  url: SITE_URL,
  logo: `${SITE_URL}/icon-512.png`,
  description: 'منصة اكتشاف محلية مصرية — من قلب شبين القناطر',
  sameAs: [],
  areaServed: {
    '@type': 'City',
    name: 'شبين القناطر',
    containedInPlace: { '@type': 'Country', name: 'Egypt' },
  },
}

export const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'EAH',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/explore?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
  inLanguage: 'ar-EG',
}
