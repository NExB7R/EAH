import type { Metadata } from 'next'
import { getNearbyBusinesses } from '@/lib/data'
import { MapPinIcon } from '@/components/icons'
import SectionLayout from '@/components/section-layout'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'قريب منك · EAH',
  description: 'الأنشطة القريبة منك في شبين القناطر والقرى حواليها',
}

export default async function NearbyPage() {
  const businesses = await getNearbyBusinesses('شبين القناطر', 200)

  return (
    <SectionLayout
      activeKey="nearby"
      title="قريب منك"
      Icon={MapPinIcon}
      tone="teal"
      badgeVariant="nearby"
      badgeLabel="قريب منك"
      businesses={businesses}
    />
  )
}
