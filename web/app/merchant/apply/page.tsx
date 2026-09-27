import type { Metadata } from 'next'
import { StoreIcon } from '@/components/icons'
import ComingSoon from '@/components/coming-soon'

export const metadata: Metadata = { title: 'سجّل نشاطك · EAH' }

export default function MerchantApplyPage() {
  return (
    <ComingSoon
      title="سجّل نشاطك"
      Icon={StoreIcon}
      tone="gold"
      message="نظام التسجيل كامل قيد التطوير — قريب"
      details={
        <div>
          <p><strong>مجاناً 100%:</strong></p>
          <p>صفحة نشاط كاملة + طلبات واتساب + إحصائيات</p>
          <p>للتواصل المبكر: واتساب 201012892806</p>
        </div>
      }
    />
  )
}
