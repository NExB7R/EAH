import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import { getMerchantContext } from '@/lib/admin/merchant-guard'
import QRCode from 'qrcode'
import './qr.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'QR Code | EAH' }

export default async function MerchantQRPage() {
  const ctx = await getMerchantContext()
  if (!ctx || ctx.businesses.length === 0) redirect('/merchant/apply')

  const biz = ctx.businesses[0]
  const publicUrl = `https://eah-sq.vercel.app/businesses/${biz.slug}`

  const svg = await QRCode.toString(publicUrl, {
    type: 'svg',
    width: 400,
    margin: 2,
    color: { dark: '#A855F7', light: '#07060B' },
  })

  return (
    <>
      <FloatingCapsuleHeader />
      <main className="qr">
        <header className="qr__hero">
          <Link href="/merchant" className="qr__back">← لوحة النشاط</Link>
          <span className="qr__kicker">MERCHANT</span>
          <h1 className="qr__title">📱 QR Code النشاط</h1>
          <p className="qr__sub">اطبع ده وحطه على واجهة المكان — الزبون يمسح ويوصل لصفحتك</p>
        </header>

        <section className="qr__card">
          <div className="qr__preview" dangerouslySetInnerHTML={{ __html: svg }} />
          <h2 className="qr__name">{biz.name}</h2>
          <span className="qr__url">{publicUrl}</span>
          <div className="qr__actions">
            <a href="/api/merchant/qr-svg" download={`${biz.slug}-qr.svg`} className="qr__btn qr__btn--primary">
              ⬇️ تحميل SVG
            </a>
            <Link href={`/businesses/${biz.slug}`} className="qr__btn">
              👁️ عرض الصفحة
            </Link>
          </div>
          <p className="qr__hint">
            💡 نصيحة: اطبع الـ QR Code على ورقة A5 وحطه على باب المحل أو الكاشير
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
