import type { Metadata } from 'next'
import { PhoneIcon } from '@/components/icons'
import ComingSoon from '@/components/coming-soon'

export const metadata: Metadata = { title: 'تواصل معانا · EAH' }

export default function ContactPage() {
  return (
    <ComingSoon
      title="تواصل معانا"
      Icon={PhoneIcon}
      tone="purple"
      message="صفحة التواصل الكاملة — قريب"
      details={
        <div>
          <p><strong>للتواصل الفوري:</strong></p>
          <p>واتساب: 201012892806</p>
          <p>إيميل: nexb7r@gmail.com</p>
        </div>
      }
    />
  )
}
