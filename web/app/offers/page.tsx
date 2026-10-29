import type { Metadata } from 'next'
import { getActiveOffers } from '@/lib/data'
import { fairOrderOffers } from '@/lib/fair-ranking'
import { GiftIcon } from '@/components/icons'
import SectionLayout from '@/components/section-layout'
import type { Business } from '@/lib/data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'العروض',
  description: 'أحدث العروض في شبين القناطر والقرى حواليها',
}

export default async function OffersPage() {
  const all = await getActiveOffers(500)
  const ordered = fairOrderOffers(all, all.length)

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
