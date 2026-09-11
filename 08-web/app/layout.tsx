import './globals.css'
import '../components/eah-studio-pro.css'
import '@puckeditor/core/puck.css'
import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import RegisterSW from '@/components/register-sw'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

const cairo = Cairo({ subsets: ['arabic'], weight: ['400', '700', '900'], display: 'swap', variable: '--font-cairo' })

export const metadata: Metadata = {
  title: { default: 'EAH | اللي نفسك فيه ؟', template: '%s | EAH' },
  description: 'EAH منصة اكتشاف محلية تبدأ من شبين القناطر: مطاعم، صيدليات، سوبر ماركت، توصيل وعروض مناسبة ليك.',
  metadataBase: new URL(siteUrl),
  alternates: { canonical: '/' },
  openGraph: { title: 'EAH | اللي نفسك فيه ؟', description: 'اكتشف اللي مناسب ليك حوالينك.', type: 'website', locale: 'ar_EG' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ar" dir="rtl" className={cairo.variable}><body>{children}<RegisterSW /></body></html>
}
