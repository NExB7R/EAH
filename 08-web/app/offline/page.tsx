import type { Metadata } from 'next'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import OfflineActions from './offline-actions'
import './offline.css'

export const metadata: Metadata = {
  title: 'أوفلاين',
  robots: { index: false, follow: false },
}

export default function OfflinePage() {
  return (
    <>
      <FloatingCapsuleHeader />
      <main className="off">
        <div className="off__inner">
          <div className="off__glow" aria-hidden />
          <div className="off__icon" aria-hidden>
            <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
              <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
              <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
              <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
              <circle cx="12" cy="20" r="1" />
            </svg>
          </div>
          <h1 className="off__title">لا يوجد اتصال بالإنترنت</h1>
          <p className="off__lead">
            يبدو إنك غير متصل الآن. معظم المحتوى المحفوظ عندك متاح،
            وباقي الصفحات هتشتغل بمجرد ما النت يرجع.
          </p>
          <OfflineActions />
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
