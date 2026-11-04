import type { Metadata } from 'next'
import { getNearbyBusinesses } from '@/lib/data'
import { fairOrder } from '@/lib/fair-ranking'
import { MapPinIcon } from '@/components/icons'
import SecondaryHero from '@/components/secondary-hero'
import NearbyDirectory from '@/components/nearby-directory'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'قريب منك',
  description: 'الأنشطة الأقرب لموقعك في شبين القناطر والقرى حواليها',
}

export default async function NearbyPage() {
  const candidates = await getNearbyBusinesses(undefined, 500)
  const businesses = fairOrder(candidates, 'nearby', {}, { topWindow: 10, maxPerType: 3 })

  return (
    <NearbyDirectory businesses={businesses}>
      <SecondaryHero
        activeKey="nearby"
        title="قريب منك"
        Icon={MapPinIcon}
        tone="teal"
      />
    </NearbyDirectory>
  )
}
