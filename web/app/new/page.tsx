import type { Metadata } from 'next'
import { getNewBusinesses } from '@/lib/data'
import { LampIcon } from '@/components/icons'
import SectionLayout from '@/components/section-layout'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'الجديد · EAH',
  description: 'الأنشطة الجديدة في شبين القناطر والقرى حواليها',
}

export default async function NewPage() {
  const businesses = await getNewBusinesses(200)

  return (
    <SectionLayout
      activeKey="new"
      title="الجديد"
      Icon={LampIcon}
      tone="pink"
      businesses={businesses}
    />
  )
}
