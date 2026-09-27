import type { Metadata } from 'next'
import { getTrendingBusinesses } from '@/lib/data'
import { TrendingUpIcon } from '@/components/icons'
import SectionLayout from '@/components/section-layout'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'الترند · EAH',
  description: 'الأنشطة الأكثر تفاعلاً في شبين القناطر والقرى حواليها',
}

export default async function TrendsPage() {
  const businesses = await getTrendingBusinesses(200)

  return (
    <SectionLayout
      activeKey="trends"
      title="الترند"
      Icon={TrendingUpIcon}
      tone="orange"
      businesses={businesses}
    />
  )
}
