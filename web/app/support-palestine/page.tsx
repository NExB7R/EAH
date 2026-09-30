import type { Metadata } from 'next'
import { MapPinIcon } from '@/components/icons'
import ComingSoon from '@/components/coming-soon'

export const metadata: Metadata = {
  title: 'فلسطين في القلب · EAH',
  description: 'دعم فلسطين — التزام حقيقي من EAH',
}

export default function SupportPalestinePage() {
  return (
    <ComingSoon
      title="فلسطين في القلب"
      Icon={MapPinIcon}
      tone="gold"
      message="التزامنا بالدعم مستمر — الصفحة الكاملة قريب"
      details={
        <div>
          <p>
            <strong>التزام EAH:</strong>
          </p>
          <p>• 5% من أرباح الباقات والإعلانات لصندوق دعم فلسطين</p>
          <p>• المنصة فلسطينية الهوى، مصرية الجذور</p>
          <p>• هنعلن تفاصيل التبرع قريب — تواصل معانا للانضمام</p>
        </div>
      }
    />
  )
}
