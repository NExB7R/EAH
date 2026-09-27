import type { Metadata } from 'next'
import { CookieIcon } from '@/components/icons'
import ComingSoon from '@/components/coming-soon'

export const metadata: Metadata = { title: 'الكوكيز · EAH' }

export default function CookiesPage() {
  return (
    <ComingSoon
      title="ملفات الكوكيز"
      Icon={CookieIcon}
      tone="purple"
      message="بنجهّز سياسة الكوكيز — قريب إن شاء الله"
    />
  )
}
