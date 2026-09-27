import type { Metadata } from 'next'
import { GiftIcon } from '@/components/icons'
import ComingSoon from '@/components/coming-soon'

export const metadata: Metadata = {
  title: 'الباقات · EAH',
  description: 'باقات مميزة لتجار شبين القناطر',
}

export default function PricingPage() {
  return (
    <ComingSoon
      title="الباقات"
      Icon={GiftIcon}
      tone="purple"
      message="بنجهّزلك باقات بأسعار مناسبة — هنعلنها قريب"
    />
  )
}
