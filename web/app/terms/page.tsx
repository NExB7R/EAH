import type { Metadata } from 'next'
import { FileTextIcon } from '@/components/icons'
import ComingSoon from '@/components/coming-soon'

export const metadata: Metadata = { title: 'الشروط · EAH' }

export default function TermsPage() {
  return (
    <ComingSoon
      title="الشروط والأحكام"
      Icon={FileTextIcon}
      tone="purple"
      message="بنحضّر الشروط القانونية — هتكون متاحة قريب"
    />
  )
}
