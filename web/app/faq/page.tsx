import type { Metadata } from 'next'
import { ShieldCheckIcon } from '@/components/icons'
import ComingSoon from '@/components/coming-soon'

export const metadata: Metadata = { title: 'الأسئلة · EAH' }

export default function FaqPage() {
  return (
    <ComingSoon
      title="الأسئلة الشائعة"
      Icon={ShieldCheckIcon}
      tone="purple"
      message="بنجمع أكثر الأسئلة — قريب"
    />
  )
}
