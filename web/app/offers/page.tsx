import type { Metadata } from 'next'
import { getActiveOffers } from '@/lib/data'
import { GiftIcon } from '@/components/icons'
import SectionLayout from '@/components/section-layout'
import type { Business } from '@/lib/data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'العروض · EAH',
  description: 'أحدث العروض في شبين القناطر والقرى حواليها',
}

export default async function OffersPage() {
  const offers = await getActiveOffers(200)
  const businesses: Business[] = offers.map((o) => o.business).filter((b): b is Business => !!b)

  return (
    <SectionLayout
      activeKey="offers"
      title="العروض"
      Icon={GiftIcon}
      tone="purple"
      businesses={businesses}
    />
  )
}
