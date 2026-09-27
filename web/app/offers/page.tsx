import type { Metadata } from 'next'
import { getActiveOffers } from '@/lib/data'
import { GiftIcon } from '@/components/icons'
import SecondaryHero from '@/components/secondary-hero'
import EditorialList from '@/components/editorial-list'
import SectionWrapper from '@/components/section-wrapper'
import type { Business } from '@/lib/data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'العروض · EAH',
  description: 'أحدث العروض في شبين القناطر والقرى حواليها',
}

export default async function OffersPage() {
  const offers = await getActiveOffers(100)
  const businesses: Business[] = offers
    .map((o) => o.business)
    .filter((b): b is Business => !!b)

  return (
    <main style={{ minHeight: '100vh', paddingBottom: '80px' }}>
      <SecondaryHero
        activeKey="offers"
        title="العروض"
        Icon={GiftIcon}
        tone="purple"
        count={businesses.length}
      />
      <SectionWrapper tone="purple">
        <EditorialList businesses={businesses} variant="offer" />
      </SectionWrapper>
    </main>
  )
}
