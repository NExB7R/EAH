import type { Metadata } from 'next'
import { ShieldCheckIcon } from '@/components/icons'
import ComingSoon from '@/components/coming-soon'

export const metadata: Metadata = { title: 'الخصوصية · EAH' }

export default function PrivacyPage() {
  return (
    <ComingSoon
      title="سياسة الخصوصية"
      Icon={ShieldCheckIcon}
      tone="purple"
      message="خصوصيتك أولوية — السياسة الكاملة قريب"
    />
  )
}
