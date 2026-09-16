import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import './offers.css'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'العروض',
  description: 'أحلى العروض في شبين القناطر — خصومات وعروض من مطاعم وصيدليات ومكاتب توصيل',
}

const TYPE_EMOJI: Record<string, string> = {
  restaurant: '🍽️',
  pharmacy: '💊',
  delivery_office: '🛵',
}

const TYPE_LABEL: Record<string, string> = {
  restaurant: 'مطعم',
  pharmacy: 'صيدلية',
  delivery_office: 'توصيل',
}

export default async function OffersPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('offers')
    .select(`
      id, title, description, teaser_image_url, created_at,
      business:businesses!inner (id, slug, name, business_type, area, is_published)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(40)

  const offers = (data ?? []).filter((o: any) => o.business?.is_published)

  return (
    <>
      <FloatingCapsuleHeader />
      <main className="off">
        <section className="off-hero">
          <div className="off-hero__glow" aria-hidden />
          <span className="off-hero__kicker">عروض EAH</span>
          <h1 className="off-hero__title">
            🔥 <span className="off-hero__accent">عروض</span> على الآخر
          </h1>
          <p className="off-hero__lead">
            خصومات حقيقية من مطاعم وصيدليات ومكاتب توصيل في شبين القناطر.
          </p>
        </section>

        {offers.length === 0 ? (
          <div className="off-empty">
            <span className="off-empty__emoji">📭</span>
            <h2 className="off-empty__title">لسه مفيش عروض</h2>
            <p className="off-empty__text">قريب جدًا هنضيف عروض جديدة.</p>
            <Link href="/explore" className="off-empty__cta">اكتشف الأماكن ←</Link>
          </div>
        ) : (
          <section className="off-grid">
            {offers.map((o: any) => {
              const b = o.business
              const emoji = TYPE_EMOJI[b.business_type] ?? '📍'
              const label = TYPE_LABEL[b.business_type] ?? b.business_type

              return (
                <article key={o.id} className="off-card">
                  <div
                    className="off-card__media"
                    style={
                      o.teaser_image_url
                        ? { backgroundImage: `url(${o.teaser_image_url})` }
                        : undefined
                    }
                  >
                    {!o.teaser_image_url && <span className="off-card__emoji">{emoji}</span>}
                    <span className="off-card__badge">🔥 عرض</span>
                  </div>
                  <div className="off-card__body">
                    <div className="off-card__meta">
                      <span className="off-card__type">{emoji} {label}</span>
                      {b.area && <span className="off-card__area">📍 {b.area}</span>}
                    </div>
                    <h3 className="off-card__title">{o.title}</h3>
                    {o.description && <p className="off-card__desc">{o.description}</p>}
                    <Link href={`/businesses/${b.slug}`} className="off-card__cta">
                      شوف العرض ←
                    </Link>
                  </div>
                </article>
              )
            })}
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
