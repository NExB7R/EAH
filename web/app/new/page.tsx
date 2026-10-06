import type { Metadata } from 'next'
import { getNewBusinesses } from '@/lib/data'
import { SunriseIcon } from '@/components/icons'
import SectionLayout from '@/components/section-layout'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'بدايات · EAH',
  description: 'مشاريع لسه فاتحة في شبين القناطر والقرى حواليها — ادعمهم',
}

export default async function NewPage() {
  const businesses = await getNewBusinesses(200)

  return (
    <SectionLayout
      activeKey="new"
      title="بدايات"
      Icon={SunriseIcon}
      tone="gold"
      businesses={businesses}
    />
  )
}
