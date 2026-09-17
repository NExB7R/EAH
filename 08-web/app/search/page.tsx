import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import EahLogo from '@/components/eah-logo'
import SiteFooter from '@/components/site-footer'
import BackToTop from '@/components/back-to-top'
import SearchBar from '@/components/search-bar'
import ExploreCard from '@/components/explore-card'
import './search.css'
import FoodFilterBar from '@/components/food-filter-bar'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'البحث' }

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; sort?: string }>
}) {
  const params = await searchParams
  const q = (params.q ?? '').trim()
  const type = params.type ?? null
  const sort = params.sort ?? 'relevance'

  const supabase = await createClient()
  const { data: results } = await supabase.rpc('search_businesses', {
    p_query: q,
    p_type: type,
    p_area: null,
    p_sort: sort,
    p_limit: 30,
    p_offset: 0,
  })

  const businesses = (results ?? []).map((b: any) => ({
    slug: b.slug,
    name: b.name,
    type: b.business_type,
    area: b.area,
    badge: b.is_featured ? 'مميز' : undefined,
    vibe: [],
    reason: b.hook ?? '',
    open: b.is_open,
  }))

  return (
    <>
      <FloatingCapsuleHeader />
      <BackToTop />
      <main className="sr">
        <header className="sr__hero">
          <Link href="/" className="sr__back">← الرئيسية</Link>
          <div className="sr__logo">
            <EahLogo size="md" variant="full" href="/" />
          </div>
          <span className="sr__kicker">بحث</span>
        <FoodFilterBar value={null} onChange={() => {}} />
          <h1 className="sr__title">🔍 البحث</h1>
          <p className="sr__sub">دوّر على أي مكان في شبين القناطر</p>
          <div className="sr__search-wrap">
            <SearchBar placeholder="اسم المكان، النوع، أو المنطقة..." />
          </div>
        </header>

        {q && (
          <div className="sr__results-head">
            <strong>{businesses.length}</strong> نتيجة لـ
            <span className="sr__query">&quot;{q}&quot;</span>
          </div>
        )}

        {businesses.length === 0 && q ? (
          <div className="sr__empty">
            <span className="sr__empty-emoji">🔍</span>
            <h2 className="sr__empty-title">مفيش نتائج</h2>
            <p className="sr__empty-text">
              جرّب كلمة تانية، أو اكتشف الأماكن مباشرة
            </p>
            <Link href="/explore" className="sr__empty-btn">
              اكتشف كل الأماكن
            </Link>
          </div>
        ) : !q ? (
          <div className="sr__hint">
            <span className="sr__hint-emoji">✨</span>
            <h2 className="sr__hint-title">اكتب أي حاجة</h2>
            <p className="sr__hint-text">
              اسم مطعم، نوع نشاط، أو منطقة معينة
            </p>
          </div>
        ) : (
          <div className="sr__grid">
            {businesses.map((b: any) => (
              <ExploreCard key={b.slug} business={b} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
