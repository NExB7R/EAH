import { getPublishedBusinesses } from '@/lib/data'
import NearMeClient from '@/components/near-me/near-me-client'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import BackToTop from '@/components/back-to-top'

export const revalidate = 120
export const metadata = { title: 'قريب مني' }

export default async function NearMePage() {
  const businesses = await getPublishedBusinesses(120)
  const items = businesses.map((b) => ({
    slug: b.slug,
    name: b.name,
    type: b.type,
    area: b.area ?? null,
    latitude: b.latitude ?? null,
    longitude: b.longitude ?? null,
    is_open: !!b.open,
  }))

  return (
    <>
      <FloatingCapsuleHeader />
      <BackToTop />
      <main className="nm-page">
        <h1 className="nm-title">قريب مني</h1>
        <p className="nm-sub">بنوريك الأقرب ليك في شبين والقرى حواليها</p>
        <NearMeClient businesses={items} />
      </main>
      <SiteFooter />
    </>
  )
}
