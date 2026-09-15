import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { getPublishedBusinesses } from '@/lib/data'
import { rankBusinesses, diversifyByCategory } from '@/lib/ranking'
import { loadUserProfileTags, parseUserTags, applyPersonalization } from '@/lib/personalization'
import { getViewStats } from '@/lib/real-stats'

import HomeHero from '@/components/home-hero'
import SectionSlider from '@/components/section-slider'
import ExploreCard from '@/components/explore-card'
import TrustSection from '@/components/trust-section'
import ComingSoon from '@/components/coming-soon'

type Section = { id: string; type: string; visible: boolean; props: any }
type DesignData = { theme?: { primaryColor?: string; bgColor?: string }; sections?: Section[] }

async function loadDesign(): Promise<DesignData | null> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('site_designs')
      .select('data')
      .eq('key', 'home')
      .maybeSingle()
    if (!data?.data) return null
    return data.data as DesignData
  } catch {
    return null
  }
}

function renderSlider(
  id: string,
  title: string,
  subtitle: string,
  href: string,
  variant: 'restaurant' | 'offer' | 'pharmacy' | 'delivery' | 'new',
  items: any[],
) {
  if (items.length === 0) return null
  return (
    <SectionSlider
      key={id}
      title={title}
      subtitle={subtitle}
      seeAllHref={href}
      variant={variant}
    >
      {items.map((b) => (
        <ExploreCard key={b.slug ?? b.name} business={b} />
      ))}
    </SectionSlider>
  )
}

export default async function HomeDynamic() {
  const businesses = await getPublishedBusinesses(50)
  const realStats = await getViewStats(businesses.map((b) => b.slug), 7)
  const withStats = businesses.map((b) => {
    const real = realStats.get(b.slug)
    return {
      ...b,
      id: b.businessId ?? b.slug,
      rating: b.rating ?? 0,
      reviewCount: b.reviewCount ?? 0,
      recentViews: real?.views ?? 0,
      recentComments: b.recentComments ?? 0,
      activeOffers: b.activeOffers ?? 0,
      ageInDays: b.ageInDays ?? 0,
      isFeatured: b.featured ?? false,
      lastShownAt: undefined,
      totalImpressions: 0,
    }
  })
  const ranked = rankBusinesses(withStats, { includeFeaturedBoost: true })
  const userTags = await loadUserProfileTags()
  const userProfile = parseUserTags(userTags)
  const personalized = applyPersonalization(ranked, userProfile)
  const diversified = diversifyByCategory(personalized, 'type')

  const design = await loadDesign()
  const KNOWN_TYPES = new Set(['hero','featured','trending','offers','categories','cta','banner','footer'])
  const allSections: Section[] = design?.sections?.filter((s) => s.visible !== false) ?? []
  // لو التصميم فيه نوع مش معروف، نتجاهله تماماً ونستخدم الافتراضي
  const unknownFound = allSections.some((s) => !KNOWN_TYPES.has(s.type))
  const sections: Section[] = unknownFound ? [] : allSections
  const theme = design?.theme

  // لو مفيش تصميم محفوظ أو تصميم غير متوافق — نستخدم الافتراضي (rich)
  if (sections.length < 3 || unknownFound) {
    const restaurants = diversified.filter((b) => b.type === 'restaurant')
    const pharmacies = diversified.filter((b) => b.type === 'pharmacy')
    const delivery = diversified.filter((b) => b.type === 'delivery_office')
    const offers = diversified
      .filter((b) => b.activeOffers > 0)
      .sort((a, b) => b.activeOffers - a.activeOffers)
    const newBiz = diversified.filter((b) => b.ageInDays < 30)

    return (
      <>
        <HomeHero />
        {renderSlider('r', 'المطاعم', 'اللي نفسك فيه', '/explore?type=restaurant', 'restaurant', restaurants)}
        {renderSlider('o', '🔥 العروض', 'على الآخر', '/offers', 'offer', offers)}
        {renderSlider('ph', 'الصيدليات', 'قريبة منك', '/explore?type=pharmacy', 'pharmacy', pharmacies)}
        {renderSlider('d', '🛵 على السريع', 'توصيل', '/explore?type=delivery_office', 'delivery', delivery)}
        {renderSlider('n', '🌱 مشاريع محتاجة فرصة', 'جديد في الحتة', '/explore', 'new', newBiz)}
        <ComingSoon />
        <TrustSection />
      </>
    )
  }

  // ─── Dynamic render من التصميم ───
  return (
    <div style={theme?.bgColor ? { background: theme.bgColor } : undefined}>
      {sections.map((section) => renderSection(section, diversified))}
      <ComingSoon />
      <TrustSection />
    </div>
  )
}

function renderSection(section: Section, businesses: any[]) {
  const p = section.props ?? {}

  switch (section.type) {
    case 'hero':
      return <HomeHero key={section.id} />

    case 'featured': {
      const featured = businesses.filter((b) => b.badge === 'مميز')
      const list = (featured.length > 0 ? featured : businesses).slice(0, p.count ?? 6)
      return renderSlider(section.id, p.title ?? '⭐ المميز', p.subtitle ?? '', '/explore', 'restaurant', list)
    }

    case 'trending': {
      const trending = businesses.slice(0, p.count ?? 6)
      return renderSlider(section.id, p.title ?? '🔥 الترند', p.subtitle ?? '', '/trends', 'restaurant', trending)
    }

    case 'offers': {
      const offers = businesses
        .filter((b) => b.activeOffers > 0)
        .sort((a, b) => b.activeOffers - a.activeOffers)
        .slice(0, p.count ?? 4)
      return renderSlider(section.id, p.title ?? '🎁 العروض', p.subtitle ?? '', '/offers', 'offer', offers)
    }

    case 'categories': {
      const items = p.items ?? []
      if (items.length === 0) return null
      return (
        <section key={section.id} style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px' }}>
          {p.title && (
            <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#F5F3FF', margin: '0 0 16px', textAlign: 'right' }}>
              {p.title}
            </h2>
          )}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            {items.map((it: any, i: number) => (
              <Link
                key={i}
                href={it.href ?? `/explore?type=${it.type ?? ''}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '12px 20px', borderRadius: 14,
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.25)',
                  color: '#F5F3FF', textDecoration: 'none', fontWeight: 700, fontSize: '.9rem',
                }}
              >
                <span>{it.emoji}</span>{it.label}
              </Link>
            ))}
          </div>
        </section>
      )
    }

    case 'cta':
      return (
        <section key={section.id} style={{ maxWidth: 900, margin: '32px auto', padding: '32px 24px', textAlign: 'center', borderRadius: 24, background: 'linear-gradient(135deg,rgba(139,92,246,.15),rgba(168,85,247,.05))', border: '1px solid rgba(139,92,246,.25)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#F5F3FF', margin: '0 0 10px' }}>
            {p.title}
          </h2>
          {p.subtitle && <p style={{ color: '#A5A3B8', fontSize: '.95rem', margin: '0 0 18px' }}>{p.subtitle}</p>}
          {p.ctaText && (
            <Link href={p.ctaHref ?? '/auth'} style={{
              display: 'inline-block', padding: '14px 28px', borderRadius: 14,
              background: 'linear-gradient(135deg,#8B5CF6,#A855F7)',
              color: '#fff', fontWeight: 900, textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(139,92,246,.4)',
            }}>{p.ctaText}</Link>
          )}
        </section>
      )

    case 'banner':
      return (
        <section key={section.id} style={{ maxWidth: 1200, margin: '20px auto', padding: '14px 20px', textAlign: 'center', borderRadius: 14, background: `${p.color ?? '#A855F7'}22`, border: `1px solid ${p.color ?? '#A855F7'}55`, color: '#F5F3FF', fontWeight: 800, fontSize: '.9rem' }}>
          {p.text}
        </section>
      )

    case 'footer':
      return null

    default:
      return null
  }
}
