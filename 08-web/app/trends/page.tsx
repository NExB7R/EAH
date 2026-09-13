import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { getViewStats } from '@/lib/real-stats'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import './trends.css'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'الترندات',
  description: 'الأماكن الأكثر رواجًا في شبين القناطر دلوقتي — بناءً على الزيارات والتقييمات والعروض.',
}

const TYPE_EMOJI: Record<string, string> = {
  restaurant: '🍽️',
  pharmacy: '💊',
  supermarket: '🛒',
  delivery_office: '🛵',
}

const TYPE_LABEL: Record<string, string> = {
  restaurant: 'مطعم',
  pharmacy: 'صيدلية',
  supermarket: 'ماركت',
  delivery_office: 'توصيل',
}

type Trend = {
  id: string
  slug: string
  name: string
  business_type: string
  area: string | null
  hook: string | null
  is_featured: boolean
  score: number
  views: number
  ageDays: number
}

const TABS = [
  { key: 'all', label: '🔥 الكل' },
  { key: 'restaurant', label: '🍽️ مطاعم' },
  { key: 'pharmacy', label: '💊 صيدليات' },
  { key: 'supermarket', label: '🛒 ماركت' },
  { key: 'delivery_office', label: '🛵 توصيل' },
]

export default async function TrendsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const sp = await searchParams
  const typeFilter = sp.type && TYPE_EMOJI[sp.type] ? sp.type : null

  const supabase = await createClient()
  const { data } = await supabase
    .from('businesses')
    .select('id,slug,name,business_type,area,hook,is_featured,created_at')
    .eq('is_published', true)
    .limit(60)

  const businesses = (data ?? []) as Array<{
    id: string
    slug: string
    name: string
    business_type: string
    area: string | null
    hook: string | null
    is_featured: boolean
    created_at: string
  }>

  // View stats (real)
  const statsMap = await getViewStats(businesses.map((b) => b.slug), 7)

  // Composite score: views × 0.6 + featured × 0.25 + freshness × 0.15
  const now = Date.now()
  const trends: Trend[] = businesses.map((b) => {
    const stat = statsMap.get(b.slug)
    const views = stat?.views ?? 0
    const ageDays = Math.floor((now - new Date(b.created_at).getTime()) / 86400000)
    const freshness = ageDays < 30 ? (30 - ageDays) / 30 : 0
    const score =
      views * 0.6 +
      (b.is_featured ? 1 : 0) * 30 +
      freshness * 15
    return {
      id: b.id,
      slug: b.slug,
      name: b.name,
      business_type: b.business_type,
      area: b.area,
      hook: b.hook,
      is_featured: b.is_featured,
      score,
      views,
      ageDays,
    }
  })

  let filtered = typeFilter ? trends.filter((t) => t.business_type === typeFilter) : trends
  filtered = filtered.sort((a, b) => b.score - a.score)
  const list = filtered.slice(0, 30)

  const podium = list.slice(0, 3)
  const rest = list.slice(3)

  const counts: Record<string, number> = { all: trends.length }
  for (const t of trends) {
    counts[t.business_type] = (counts[t.business_type] ?? 0) + 1
  }

  return (
    <>
      <FloatingCapsuleHeader />
      <main className="tr">
        <section className="tr-hero">
          <span className="tr-hero__kicker">EAH TRENDS</span>
          <h1 className="tr-hero__title">🔥 الترندات</h1>
          <p className="tr-hero__lead">
            الأماكن اللي بتشد الناس دلوقتي — بناءً على زيارات حقيقية، تقييمات، وعروض نشطة.
          </p>
        </section>

        <nav className="tr-tabs">
          {TABS.map((t) => {
            const cnt = t.key === 'all' ? counts.all : counts[t.key] ?? 0
            const active = (typeFilter ?? 'all') === t.key
            return (
              <Link
                key={t.key}
                href={t.key === 'all' ? '/trends' : `/trends?type=${t.key}`}
                className={`tr-tab ${active ? 'is-active' : ''}`}
              >
                {t.label}
                <span className="tr-tab__badge">{cnt}</span>
              </Link>
            )
          })}
        </nav>

        {list.length === 0 ? (
          <div className="tr-empty">
            <span className="tr-empty__emoji">📭</span>
            <h2 className="tr-empty__title">لسه مفيش ترندات هنا</h2>
            <p className="tr-empty__text">
              {typeFilter ? 'جرّب فئة تانية' : 'لسه مفيش بيانات كفاية — قريب جدًا!'}
            </p>
          </div>
        ) : (
          <>
            {podium.length > 0 && (
              <section className="tr-podium">
                {podium.map((t, i) => {
                  const medals = ['🥇', '🥈', '🥉']
                  const rankClasses = ['is-gold', 'is-silver', 'is-bronze']
                  return (
                    <Link
                      key={t.id}
                      href={`/businesses/${t.slug}`}
                      className={`tr-pod tr-pod--${i + 1} ${rankClasses[i]}`}
                    >
                      <span className="tr-pod__medal">{medals[i]}</span>
                      <span className="tr-pod__emoji">{TYPE_EMOJI[t.business_type] ?? '🏪'}</span>
                      <h3 className="tr-pod__name">{t.name}</h3>
                      <span className="tr-pod__meta">
                        {TYPE_LABEL[t.business_type] ?? t.business_type}
                        {t.area ? ` • ${t.area}` : ''}
                      </span>
                      {t.hook && <p className="tr-pod__hook">✨ {t.hook}</p>}
                      <div className="tr-pod__stats">
                        <span className="tr-pod__views">👁 {t.views}</span>
                        {t.is_featured && <span className="tr-pod__star">⭐ مميز</span>}
                        {t.ageDays < 30 && <span className="tr-pod__new">🌱 جديد</span>}
                      </div>
                    </Link>
                  )
                })}
              </section>
            )}

            {rest.length > 0 && (
              <ol className="tr-list">
                {rest.map((t, i) => (
                  <li key={t.id} className="tr-item">
                    <Link href={`/businesses/${t.slug}`} className="tr-item__link">
                      <span className="tr-item__rank">{i + 4}</span>
                      <span className="tr-item__emoji">
                        {TYPE_EMOJI[t.business_type] ?? '🏪'}
                      </span>
                      <div className="tr-item__info">
                        <span className="tr-item__name">{t.name}</span>
                        <span className="tr-item__meta">
                          {TYPE_LABEL[t.business_type] ?? t.business_type}
                          {t.area ? ` • ${t.area}` : ''}
                        </span>
                      </div>
                      <div className="tr-item__stats">
                        <span className="tr-item__views">👁 {t.views}</span>
                        {t.is_featured && <span className="tr-item__star">⭐</span>}
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
