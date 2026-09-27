import type { Metadata } from 'next'
import { TrendingUpIcon } from '@/components/icons'
import ComingSoon from '@/components/coming-soon'

export const metadata: Metadata = {
  title: 'أعلن معانا · EAH',
  description: 'أعلن معانا في شبين القناطر',
}

export default function AdvertisePage() {
  return (
    <ComingSoon
      title="أعلن معانا"
      Icon={TrendingUpIcon}
      tone="orange"
      message="إعلانات ذكية توصل لعملاء حقيقيين — قريب"
    />
  )
}
