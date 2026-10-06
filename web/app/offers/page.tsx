import type { Metadata } from 'next'
import { getActiveOffers } from '@/lib/data'
import { fairRotateOffers } from '@/lib/offers-rotation'
import { GiftIcon } from '@/components/icons'
import SectionLayout from '@/components/section-layout'
import type { Business } from '@/lib/data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'العروض · EAH',
  description: 'أحدث العروض في شبين القناطر والقرى حواليها',
}

export default async function OffersPage() {
  const all = await getActiveOffers(200)
  const rotated = fairRotateOffers(all, 8)
  const rotatedIds = new Set(rotated.map((o) => o.id))
  const rest = all.filter((o) => !rotatedIds.has(o.id))
  const ordered = [...rotated, ...rest]

  const businesses: Business[] = ordered.map((o) => o.business).filter((b): b is Business => !!b)

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
