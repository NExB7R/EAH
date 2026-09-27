import type { Metadata } from 'next'
import { getTrendingBusinesses } from '@/lib/data'
import { TrendingUpIcon } from '@/components/icons'
import SecondaryHero from '@/components/secondary-hero'
import EditorialList from '@/components/editorial-list'
import SectionWrapper from '@/components/section-wrapper'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'الترند · EAH',
  description: 'الأنشطة الأكثر تفاعلاً في شبين القناطر والقرى حواليها',
}

export default async function TrendsPage() {
  const businesses = await getTrendingBusinesses(100)

  return (
    <main style={{ minHeight: '100vh', paddingBottom: '80px' }}>
      <SecondaryHero
        activeKey="trends"
        title="الترند"
        Icon={TrendingUpIcon}
        tone="orange"
        count={businesses.length}
      />
      <SectionWrapper tone="orange">
        <EditorialList businesses={businesses} variant="trend" />
      </SectionWrapper>
    </main>
  )
}
