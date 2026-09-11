import './globals.css'
import type { Metadata } from 'next'
import RegisterSW from '@/components/register-sw'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  title: { default: 'EAH | إيه محتاج؟', template: '%s | EAH' },
  description: 'EAH منصة اكتشاف محلية تبدأ من شبين القناطر: مطاعم، صيدليات، سوبر ماركت، توصيل وعروض مناسبة ليك.',
  metadataBase: new URL(siteUrl),
  alternates: { canonical: '/' },
  openGraph: { title: 'EAH | إيه محتاج؟', description: 'اكتشف اللي مناسب ليك حوالينك.', type: 'website', locale: 'ar_EG' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ar" dir="rtl"><body>{children}<RegisterSW /></body></html>
}
