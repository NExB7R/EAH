import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import ExploreCard from '@/components/explore-card'
import { generateMockStats } from '@/lib/mock-stats'
import './new.css'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'مشاريع محتاجة فرصة',
  description: 'مشاريع صغيرة تستحق تشوفوها — ادعموهم في البداية',
}

export default async function NewPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('businesses')
    .select('id,slug,name,business_type,area,hook,cover_image_url,is_open,created_at')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(30)

  const businesses = (data ?? []).map((b: any) => {
    const stats = generateMockStats({ slug: b.slug, name: b.name, featured: false })
    return {
      ...stats,
      slug: b.slug, name: b.name, type: b.business_type, area: b.area,
      badge: '🌱 جديد', vibe: [], reason: b.hook ?? '', open: b.is_open,
    }
  })

  return (
    <>
      <FloatingCapsuleHeader />
      <main className="nw">
        <header className="nw__hero">
          <Link href="/" className="nw__back">← الرئيسية</Link>
          <div className="nw__glow" aria-hidden />
          <span className="nw__kicker">DISCOVER NEW</span>
          <h1 className="nw__title">🌱 <span className="nw__accent">مشاريع محتاجة فرصة</span></h1>
          <p className="nw__lead">
            مشاريع جديدة وصغيرة — كل تجربة بتفرق معاهم
          </p>
        </header>

        <div className="nw__banner">
          <span className="nw__banner-emoji">💚</span>
          <div className="nw__banner-body">
            <strong className="nw__banner-title">دعم المشاريع المحلية</strong>
            <p className="nw__banner-text">جربهم، قيمهم، ساعدهم يكبروا</p>
          </div>
          <Link href="/merchant/apply" className="nw__banner-cta">سجّل مشروعك</Link>
        </div>

        {businesses.length === 0 ? (
          <div className="nw__empty">
            <span className="nw__empty-emoji">🌱</span>
            <h2 className="nw__empty-title">لسه مفيش مشاريع جديدة</h2>
            <p className="nw__empty-text">قريب هنضيف مشاريع صغيرة محلية</p>
          </div>
        ) : (
          <section className="nw__grid">
            {businesses.map((b: any) => <ExploreCard key={b.slug} business={b} />)}
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
