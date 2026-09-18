import { Suspense } from 'react'
import HomeDynamicV2 from '@/components/home-dynamic-v2'
import DesignRenderer from '@/components/studio/design-renderer'
import SiteFooter from '@/components/site-footer'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SidePanel from '@/components/side-panel'
import BackToTop from '@/components/back-to-top'
import { createClient } from '@/lib/supabase-server'
import { getPublishedBusinesses } from '@/lib/data'
import type { DesignData } from '@/components/studio/types'

export const revalidate = 60

async function loadDesign(): Promise<DesignData | null> {
  try {
    const sb = await createClient()
    const { data } = await sb.from('site_designs').select('data').eq('key', 'home').maybeSingle()
    const d = data?.data as DesignData | null
    if (!d || !Array.isArray(d.sections) || d.sections.length === 0) return null
    return d
  } catch { return null }
}

export default async function Page() {
  const design = await loadDesign()

  let businesses: any[] = []
  if (design) {
    const raw = await getPublishedBusinesses(60)
    businesses = raw.map((b) => ({
      id: b.businessId ?? b.slug,
      name: b.name,
      slug: b.slug,
      hook: (b as any).hook ?? null,
      business_type: b.type,
      is_featured: !!b.featured,
    }))
  }

  return (
    <>
      <FloatingCapsuleHeader />
      <Suspense fallback={null}><SidePanel /></Suspense>
      <BackToTop />
      {design ? (
        <DesignRenderer initial={design} businesses={businesses as any} />
      ) : (
        <HomeDynamicV2 />
      )}
      <SiteFooter />
    </>
  )
}
