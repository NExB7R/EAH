import { Suspense } from 'react'
import HomeDynamic from '@/components/home-dynamic'
import DesignRenderer from '@/components/studio/design-renderer'
import SiteFooter from '@/components/site-footer'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SidePanel from '@/components/side-panel'
import BackToTop from '@/components/back-to-top'
import { createClient } from '@/lib/supabase-server'
import { getPublishedBusinesses } from '@/lib/data'
import { rankBusinesses, diversifyByCategory } from '@/lib/ranking'
import { generateMockStats } from '@/lib/mock-stats'
import type { DesignData } from '@/components/studio/types'

export const revalidate = 60

async function getHomeDesign(): Promise<DesignData | null> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('site_designs')
      .select('data')
      .eq('key', 'home')
      .maybeSingle()
    const raw = data?.data as DesignData | null
    if (raw && Array.isArray(raw.sections) && raw.sections.length > 0) {
      return raw
    }
    return null
  } catch {
    return null
  }
}

export default async function Page() {
  const design = await getHomeDesign()

  // نجهّز البيانات للأقسام لو فيه design — بس عشان ما نثقلش الصفحة الافتراضية
  let businesses: Array<Record<string, unknown>> = []
  if (design) {
    try {
      const raw = await getPublishedBusinesses(50)
      const withStats = raw.map((b) => ({
        ...b,
        ...generateMockStats({
          slug: b.slug,
          name: b.name,
          featured: b.badge === 'مميز',
        }),
      }))
      businesses = diversifyByCategory(
        rankBusinesses(withStats, { includeFeaturedBoost: true }),
        'type',
      ) as Array<Record<string, unknown>>
    } catch {
      businesses = []
    }
  }

  return (
    <>
      <FloatingCapsuleHeader />
      <Suspense fallback={null}>
        <SidePanel />
      </Suspense>
      <BackToTop />
      {design ? (
        <DesignRenderer initial={design} businesses={businesses as any} />
      ) : (
        <HomeDynamic />
      )}
      <SiteFooter />
    </>
  )
}
