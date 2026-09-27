import type { Metadata } from 'next'
import { getNearbyBusinesses } from '@/lib/data'
import { MapPinIcon } from '@/components/icons'
import SecondaryHero from '@/components/secondary-hero'
import HeroGrid from '@/components/hero-grid'
import SectionWrapper from '@/components/section-wrapper'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'قريب منك · EAH',
  description: 'الأنشطة القريبة منك في شبين القناطر والقرى حواليها',
}

export default async function NearbyPage() {
  const businesses = await getNearbyBusinesses('شبين القناطر', 100)

  return (
    <main style={{ minHeight: '100vh', paddingBottom: '80px' }}>
      <SecondaryHero
        activeKey="nearby"
        title="قريب منك"
        Icon={MapPinIcon}
        tone="teal"
        count={businesses.length}
      />
      <SectionWrapper tone="teal">
        <HeroGrid businesses={businesses} variant="nearby" />
      </SectionWrapper>
    </main>
  )
}
