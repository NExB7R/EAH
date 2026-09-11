import Link from 'next/link'
import { getBusinessBySlug } from '@/lib/data'
import PageViewTracker from '@/components/page-view-tracker'
import EahAdSlot from '@/components/eah-ad-slot'

export default async function BusinessPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const business = await getBusinessBySlug(slug)
  if (!business) return <main className="container page-pad"><h1 className="page-title">النشاط مش موجود</h1><Link className="pill" href="/explore">← رجوع للاكتشاف</Link></main>
  const schemaType = business.type === 'restaurant' ? 'Restaurant' : business.type === 'pharmacy' ? 'Pharmacy' : 'Store'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return <main className="container page-pad">
    <PageViewTracker businessId={business.businessId} />
    <Link className="pill" href="/">← الرئيسية</Link>
    <EahAdSlot slotKey="business_top" />
    <article className="detail-card">
      <div className="detail-cover">{business.type === 'restaurant' ? '🍽️' : business.type === 'pharmacy' ? '💊' : business.type === 'supermarket' ? '🛒' : '📦'}</div>
      <div className="detail-body"><div className="eyebrow">{business.area}</div><h1 className="page-title">{business.name}</h1><div className="vibes">{business.vibe.map(v => <span className="vibe" key={v}>{v}</span>)}</div><p className="lead">{business.reason}</p><div className="detail-actions"><button className="primary">♡ ضيفها لمفضلاتك</button><button className="ghost-btn">شارك</button></div></div>
    </article>
    <EahAdSlot slotKey="business_inline" />
    <section className="section"><div className="section-head"><div><h2>ليه ظهر لك؟</h2><span>الشفافية جزء من التوصية</span></div></div><div className="why-panel"><strong>✨ السبب:</strong> {business.reason}. <strong>+ القرب والمزاج:</strong> إشارات متوافقة مع نوع النشاط.</div></section>
    {business.menu && <section className="section"><div className="section-head"><div><h2>المنيو</h2><span>صور المنيو هتظهر هنا</span></div></div><div className="menu-placeholder">{business.menu.map(x => <div className="menu-line" key={x}>{x}<span>→</span></div>)}</div></section>}
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': schemaType, name: business.name, address: { '@type':'PostalAddress', addressLocality:'شبين القناطر', addressCountry:'EG' }, url: `${siteUrl}/businesses/${business.slug}` }) }} />
  </main>
}
