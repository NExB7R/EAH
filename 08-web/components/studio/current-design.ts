import type { DesignData } from '@/components/studio/types'

export const currentHomeDesign: DesignData = {
  theme: { primaryColor: '#A855F7', bgColor: '#07060B', fontFamily: 'Cairo' },
  sections: [
    { id: 'hero', type: 'hero', visible: true, props: {
        title: 'اللي نفسك فيه ؟',
        subtitle: 'كل حاجة محتاجها في مكان واحد',
        ctaText: 'اكتشف', ctaHref: '/explore',
        align: 'center', showSearch: true,
    } },
    { id: 'featured', type: 'featured', visible: true, props: {
        title: 'المميزين',
        subtitle: 'أماكن اختارها فريقنا — على مستوى عالي',
        count: 6,
    } },
    { id: 'trending', type: 'trending', visible: true, props: {
        title: 'الترند',
        subtitle: 'الناس بتدور عليها دلوقتي',
        count: 6,
    } },
    { id: 'new', type: 'new', visible: true, props: {
        title: 'الجديد',
        subtitle: 'أخواتنا اللي بيبدأوا — ادعمهم',
        count: 6,
    } },
    { id: 'categories', type: 'categories', visible: true, props: {
        title: 'بتدور على إيه؟',
        items: [
          { emoji: '', label: 'مطاعم',   href: '/explore?type=restaurant' },
          { emoji: '', label: 'صيدليات', href: '/explore?type=pharmacy' },
          { emoji: '', label: 'ماركت',   href: '/explore?type=supermarket' },
          { emoji: '', label: 'توصيل',   href: '/explore?type=delivery_office' },
        ],
    } },
    { id: 'cta', type: 'cta', visible: true, props: {
        title: 'سجل وخلّي حسابك يستفيد',
        subtitle: 'احتفظ بالمفضلة، تابع العروض، واكسب نقاط',
        ctaText: 'سجّل بسرعة', ctaHref: '/auth',
    } },
  ],
}
