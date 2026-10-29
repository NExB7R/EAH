import type { Metadata } from 'next'
import { getNearbyBusinesses } from '@/lib/data'
import { fairOrder } from '@/lib/fair-ranking'
import { MapPinIcon } from '@/components/icons'
import SectionLayout from '@/components/section-layout'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  'قريب منك',
  description: 'الأنشطة القريبة منك في شبين القناطر والقرى حواليها',
}

export default async function NearbyPage() {
  const raw = await getNearbyBusinesses('شبين القناطر', 500)
  const businesses = fairOrder(
    raw,
    'nearby',
    { area: 'شبين القناطر' },
    { topWindow: 10, maxPerType: 3 },
  )

  return (
    <SectionLayout
      activeKey="nearby"
      title="قريب منك"
      Icon={MapPinIcon}
      tone="teal"
      businesses={businesses}
    />
  )
}
