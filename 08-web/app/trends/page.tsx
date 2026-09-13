import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import './trends.css'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'الترندات | EAH',
  description: 'الأماكن الأكثر رواجًا في شبين القناطر دلوقتي',
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

export default async function TrendsPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('businesses')
    .select('id,slug,name,business_type,area,hook,is_featured,created_at')
    .eq('is_published', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(30)

  const list = data ?? []

  return (
    <>
      <FloatingCapsuleHeader />
      <main className="tr">
        <section className="tr-hero">
          <span className="tr-hero__kicker">EAH TRENDS</span>
          <h1 className="tr-hero__title">🔥 الترندات</h1>
          <p className="tr-hero__lead">
            الأماكن اللي الناس بتدور عليها في شبين القناطر دلوقتي.
          </p>
        </section>

        {list.length === 0 ? (
          <div className="tr-empty">
            <span className="tr-empty__emoji">📭</span>
            <p className="tr-empty__text">لسه مفيش ترندات — قريب جدًا!</p>
          </div>
        ) : (
          <ol className="tr-list">
            {list.map((b, i) => (
              <li key={b.id} className="tr-item">
                <span className={`tr-item__rank ${i < 3 ? 'tr-item__rank--top' : ''}`}>
                  {i + 1}
                </span>
                <div className="tr-item__body">
                  <Link href={`/businesses/${b.slug}`} className="tr-item__name">
                    {TYPE_EMOJI[b.business_type] ?? '📍'} {b.name}
                  </Link>
                  <div className="tr-item__meta">
                    <span className="tr-item__chip">{TYPE_LABEL[b.business_type] ?? b.business_type}</span>
                    {b.area && <span className="tr-item__area">📍 {b.area}</span>}
                    {b.is_featured && <span className="tr-item__featured">⭐ مميز</span>}
                  </div>
                  {b.hook && <p className="tr-item__hook">{b.hook}</p>}
                </div>
              </li>
            ))}
          </ol>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
