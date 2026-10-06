import type { Metadata } from 'next'
import { getTrendingBusinesses } from '@/lib/data'
import { fairOrder } from '@/lib/fair-ranking'
import { TrendingUpIcon } from '@/components/icons'
import SectionLayout from '@/components/section-layout'
import AdSlot from '@/components/ad-slot'
import { getActiveAdsForSlot } from '@/lib/data/ads'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'الترند · EAH',
  description: 'الأنشطة الأكثر تفاعلاً في شبين القناطر والقرى حواليها',
}

export default async function TrendsPage() {
  const [businesses, ads] = await Promise.all([
    getTrendingBusinesses(200),
    getActiveAdsForSlot('trend_pin', 1),
  ])

  return (
    <>
      {ads.length > 0 && (
        <div style={{ maxWidth: 1240, margin: '24px auto 0', padding: '0 20px' }}>
          <AdSlot ads={ads} variant="banner" />
        </div>
      )}
      <SectionLayout
        activeKey="trends"
        title="الترند"
        Icon={TrendingUpIcon}
        tone="orange"
        businesses={businesses}
      />
    </>
  )
}
