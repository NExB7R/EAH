import { defaultDesign } from '@/components/studio/types'
import type { DesignData } from '@/components/studio/types'

// التصميم المطابق للصفحة الرئيسية الحالية
export const currentHomeDesign: DesignData = {
  theme: { primaryColor: '#A855F7', bgColor: '#07060B', fontFamily: 'Cairo' },
  sections: [
    { id: 'hero',       type: 'hero',       visible: true, props: { title: 'اللي نفسك فيه ؟', subtitle: 'جمهورية شبين القناطر تتحدث...', ctaText: 'اكتشف', ctaHref: '/explore', align: 'center', showSearch: true } },
    { id: 'featured',   type: 'featured',   visible: true, props: { title: 'المميز',  subtitle: 'أماكن تستاهل', count: 6 } },
    { id: 'offers',     type: 'offers',     visible: true, props: { title: 'العروض', subtitle: 'على الآخر',     count: 6 } },
    { id: 'trending',   type: 'trending',   visible: true, props: { title: ' الترندات', subtitle: 'الناس بتدور عليها', count: 6 } },
    { id: 'categories', type: 'categories', visible: true, props: { title: 'بتدور على إيه؟', items: [
      { emoji: '️', label: 'مطاعم', href: '/explore?type=restaurant' },
      { emoji: '', label: 'صيدليات', href: '/explore?type=pharmacy' },
      { emoji: '', label: 'توصيل', href: '/explore?type=delivery_office' },
    ] } },
    { id: 'cta',        type: 'cta',        visible: true, props: { title: 'سجل وخلّي حسابك يستفيد', subtitle: 'احتفظ بالمفضلة، تابع العروض، واكسب نقاط', ctaText: 'سجّل بسرعة', ctaHref: '/auth' } },
  ],
}
