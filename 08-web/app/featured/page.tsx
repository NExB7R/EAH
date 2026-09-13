import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import ExploreCard from '@/components/explore-card'
import { generateMockStats } from '@/lib/mock-stats'
import './featured.css'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'المميزون | EAH',
  description: 'أفضل الأماكن في شبين القناطر — مختارة بعناية',
}

export default async function FeaturedPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('businesses')
    .select('id,slug,name,business_type,area,hook,cover_image_url,is_open')
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })

  const businesses = (data ?? []).map((b: any) => {
    const stats = generateMockStats({ slug: b.slug, name: b.name, featured: true })
    return {
      ...stats,
      slug: b.slug, name: b.name, type: b.business_type, area: b.area,
      badge: '⭐ مميز', vibe: [], reason: b.hook ?? '', open: b.is_open,
    }
  })

  return (
    <>
      <FloatingCapsuleHeader />
      <main className="ft">
        <header className="ft__hero">
          <Link href="/" className="ft__back">← الرئيسية</Link>
          <div className="ft__glow" aria-hidden />
          <span className="ft__kicker">FEATURED</span>
          <h1 className="ft__title">⭐ <span className="ft__accent">المميزون</span></h1>
          <p className="ft__lead">
            أماكن اختارتها EAH بعناية — جودة عالية وخدمة مميزة
          </p>
          <Link href="/advertise" className="ft__cta">📢 عايز مكانك هنا؟</Link>
        </header>

        {businesses.length === 0 ? (
          <div className="ft__empty">
            <span className="ft__empty-emoji">✨</span>
            <h2 className="ft__empty-title">لسه مفيش أماكن مميزة</h2>
            <p className="ft__empty-text">قريب هنضيف أحسن الأماكن</p>
          </div>
        ) : (
          <section className="ft__grid">
            {businesses.map((b: any) => <ExploreCard key={b.slug} business={b} />)}
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
