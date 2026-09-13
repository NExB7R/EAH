import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import BackToTop from '@/components/back-to-top'
import './offers.css'

export const revalidate = 300
export const metadata = {
  title: 'العروض | EAH',
  description: 'كل العروض النشطة على منصة EAH',
}

const TYPE_EMOJI: Record<string, string> = {
  restaurant: '🍽️',
  pharmacy: '💊',
  delivery_office: '🛵',
}

type Offer = {
  id: string
  title: string
  description: string | null
  price: number | null
  image_url: string | null
  teaser_image_path: string | null
  ends_at: string | null
  businesses: { name: string; slug: string; business_type: string; area: string | null } | null
}

export default async function OffersPage() {
  const supabase = await createClient()
  const now = new Date().toISOString()
  const { data } = await supabase
    .from('offers')
    .select('id,title,description,price,image_url,teaser_image_path,ends_at,businesses(name,slug,business_type,area)')
    .eq('is_published', true)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order('created_at', { ascending: false })
    .limit(60)

  const offers = (data ?? []) as unknown as Offer[]

  return (
    <>
      <FloatingCapsuleHeader />
      <BackToTop />
      <main className="offers-page">
        <div className="offers-page__head">
          <span className="offers-page__kicker">العروض</span>
          <h1 className="offers-page__title">🔥 كل العروض النشطة</h1>
          <p className="offers-page__sub">{offers.length} عرض من مطاعم وصيدليات ومحلات قريبة</p>
        </div>

        {offers.length === 0 ? (
          <div className="offers-page__empty">
            <span>🎁</span>
            <p>لسه مفيش عروض — ارجع تاني قريب</p>
          </div>
        ) : (
          <div className="offers-page__grid">
            {offers.map((o) => {
              const img = o.image_url || o.teaser_image_path
              const daysLeft = o.ends_at
                ? Math.max(0, Math.ceil((new Date(o.ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                : null

              return (
                <Link key={o.id} href={o.businesses ? `/businesses/${o.businesses.slug}` : '#'} className="off-card">
                  <div className="off-card__image" style={img ? { backgroundImage: `url(${img})` } : undefined}>
                    {!img && <span className="off-card__img-placeholder">🎁</span>}
                    {o.price !== null && <span className="off-card__price">{o.price} ج.م</span>}
                    {daysLeft !== null && daysLeft <= 3 && (
                      <span className="off-card__urgent">⏱ باقي {daysLeft} يوم</span>
                    )}
                  </div>
                  <div className="off-card__body">
                    <div className="off-card__biz">
                      <span>{TYPE_EMOJI[o.businesses?.business_type ?? 'restaurant']}</span>
                      <span className="off-card__biz-name">{o.businesses?.name}</span>
                    </div>
                    <h3 className="off-card__title">{o.title}</h3>
                    {o.description && <p className="off-card__desc">{o.description}</p>}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
