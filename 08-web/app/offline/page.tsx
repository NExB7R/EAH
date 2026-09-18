import type { Metadata } from 'next'
import Link from 'next/link'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import OfflineActions from './offline-actions'
import { IcWifi, IcCompass, IcRefresh } from '@/components/eah-icons'
import './offline.css'

export const metadata: Metadata = {
  title: 'النت فاصل',
  robots: { index: false, follow: false },
}

export default function OfflinePage() {
  return (
    <>
      <FloatingCapsuleHeader />
      <main className="off">
        <div className="off__inner">
          <div className="off__glow" aria-hidden />

          <span className="off__icon" aria-hidden>
            <IcWifi />
          </span>

          <span className="off__kicker">أوفلاين</span>

          <h1 className="off__title">
            النت فاصل يا أخويا
          </h1>

          <p className="off__body">
            مش قادرين نوصل للسيرفر دلوقتي.<br/>
            جرّب تشوف الواي فاي، أو ارجع لما الإشارة ترجع.
          </p>

          <OfflineActions />

          <Link href="/" className="off__link">
            <IcCompass /> الرئيسية
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
