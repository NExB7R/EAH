import type { Metadata } from 'next'
import { getNewBusinesses } from '@/lib/data'
import { SunriseIcon } from '@/components/icons'
import SectionLayout from '@/components/section-layout'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'الأنشطة الجديدة',
  description: 'اكتشف الأنشطة الجديدة التي اختار الأدمن دعم ظهورها خلال أول شهر.',
}

export default async function NewPage() {
  const businesses = await getNewBusinesses(1000)

  return (
    <SectionLayout
      activeKey="new"
      title="الأنشطة الجديدة"
      Icon={SunriseIcon}
      tone="gold"
      businesses={businesses}
    />
  )
}
