import { getPublishedBusinesses } from '@/lib/data'
import NearMeClient from '@/components/near-me/near-me-client'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'

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
      <main className="e-page">
        <h1 className="nm-title e-gradient">قريب مني</h1>
        <p className="e-page__sub">بنوريك الأقرب ليك في شبين والقرى حواليها</p>
        <NearMeClient businesses={items} />
      </main>
      <SiteFooter />
    </>
  )
}
