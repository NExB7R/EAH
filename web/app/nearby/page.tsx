import type { Metadata } from 'next'
import { getNearbyBusinesses } from '@/lib/data'
import { MapPinIcon } from '@/components/icons'
import SectionPage from '@/components/section-page'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'قريب منك · EAH',
  description: 'الأنشطة القريبة منك في شبين القناطر والقرى حواليها',
}

export default async function NearbyPage() {
  const businesses = await getNearbyBusinesses('شبين القناطر', 50)
  return (
    <SectionPage
      title="قريب منك"
      Icon={MapPinIcon}
      tone="teal"
      activeKey="nearby"
      businesses={businesses}
      count={businesses.length}
    />
  )
}
