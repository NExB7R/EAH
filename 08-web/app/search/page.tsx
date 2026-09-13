import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import SearchBar from '@/components/search-bar'
import ExploreCard from '@/components/explore-card'
import './search.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'البحث | EAH' }

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
      <main className="sr">
        <header className="sr__hero">
          <Link href="/" className="sr__back">← الرئيسية</Link>
          <span className="sr__kicker">SEARCH</span>
          <h1 className="sr__title">🔍 البحث</h1>
        </header>

        <div className="sr__bar">
          <SearchBar initialQuery={q} autoFocus size="lg" />
        </div>

        {q && (
          <p className="sr__count">
            {businesses.length > 0
              ? `${businesses.length} نتيجة لـ "${q}"`
              : `مفيش نتايج لـ "${q}"`}
          </p>
        )}

        {businesses.length === 0 ? (
          <div className="sr__empty">
            <span className="sr__empty-emoji">{q ? '🔍' : '✨'}</span>
            <h2 className="sr__empty-title">{q ? 'مفيش نتايج' : 'ابدأ البحث'}</h2>
            <p className="sr__empty-text">
              {q ? 'جرّب كلمة تانية أو اتصفح كل الأماكن' : 'اكتب اسم مطعم، صيدلية، أو منطقة'}
            </p>
            <Link href="/explore" className="sr__empty-cta">اكتشف كل الأماكن ←</Link>
          </div>
        ) : (
          <section className="sr__grid">
            {businesses.map((b: any) => <ExploreCard key={b.slug} business={b} />)}
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
