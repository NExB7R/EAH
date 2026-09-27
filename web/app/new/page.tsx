import type { Metadata } from 'next'
import { getNewBusinesses } from '@/lib/data'
import { LampIcon } from '@/components/icons'
import SectionPage from '@/components/section-page'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'الجديد · EAH',
  description: 'الأنشطة الجديدة في شبين القناطر والقرى حواليها',
}

export default async function NewPage() {
  const businesses = await getNewBusinesses(50)
  return (
    <SectionPage
      title="الجديد"
      Icon={LampIcon}
      tone="pink"
      activeKey="new"
      businesses={businesses}
      count={businesses.length}
    />
  )
}
