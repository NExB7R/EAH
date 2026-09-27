import type { Metadata } from 'next'
import { getNewBusinesses } from '@/lib/data'
import { LampIcon } from '@/components/icons'
import SecondaryHero from '@/components/secondary-hero'
import HeroGrid from '@/components/hero-grid'
import SectionWrapper from '@/components/section-wrapper'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'الجديد · EAH',
  description: 'الأنشطة الجديدة في شبين القناطر والقرى حواليها',
}

export default async function NewPage() {
  const businesses = await getNewBusinesses(100)

  return (
    <main style={{ minHeight: '100vh', paddingBottom: '80px' }}>
      <SecondaryHero
        activeKey="new"
        title="الجديد"
        Icon={LampIcon}
        tone="pink"
        count={businesses.length}
      />
      <SectionWrapper tone="pink">
        <HeroGrid businesses={businesses} variant="new" />
      </SectionWrapper>
    </main>
  )
}
