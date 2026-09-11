import type { EahPageData } from './eah-page-builder-pro2'

export const defaultEahPageData: EahPageData = {
  root: {
    props: {
      width: '100%',
      maxWidth: 'none',
      minHeight: 0,
      padding: 0,
      paddingInline: 0,
      paddingBlock: 0,
      marginTop: 0,
      marginBottom: 0,
      gap: 16,
      background: '#07060B',
      backgroundImage: '',
      borderColor: 'rgba(255,255,255,.08)',
      borderWidth: 0,
      borderRadius: 22,
      shadow: 'none',
      opacity: 1,
      blur: 0,
      overflow: 'visible',
    },
  },
  content: [
    { type: 'Logo', props: { id: 'logo', tagline: 'اللي نفسك فيه ؟', size: 112, glow: 1, align: 'center' } },
    { type: 'Hero', props: { id: 'hero', eyebrow: 'شبين القناطر وما حواليها', title: 'اللي نفسك فيه ؟', description: 'اكتشف اللي مناسب ليك. وكل ما تستخدم EAH، الترشيحات تظبط أكتر على ذوقك.', searchPlaceholder: 'دور على مطعم، صيدلية، سوبر ماركت...', align: 'center', size: 'large', style: {}, responsive: {} } },
    { type: 'BusinessSection', props: { id: 'trend', title: 'الترند في المطاعم بيقول إيه !', subtitle: 'حاجات الناس بتتفاعل معاها دلوقتي', variant: 'trend', limit: 4, showLink: true, layout: 'grid', tone: 'spotlight', style: {}, responsive: {} } },
    { type: 'CTA', props: { id: 'recommend', eyebrow: 'مش عارف تختار؟', title: 'رشّحلي على زوقي', description: 'قولّي ميزانيتك ومزاجك وأنا أطلعلك كام اختيار مناسب.', href: '/recommend', tone: 'purple', style: {}, responsive: {} } },
    { type: 'BusinessSection', props: { id: 'offers', title: 'العروض ع إيه !', subtitle: 'عروض متجددة من الأماكن اللي تهمك', variant: 'offers', limit: 4, showLink: true, layout: 'grid', tone: 'accent', style: {}, responsive: {} } },
    { type: 'BusinessSection', props: { id: 'new', title: 'جرب الجديد', subtitle: 'مشاريع وأماكن لسه طالعة للنور', variant: 'new', limit: 4, showLink: true, layout: 'grid', tone: 'default', style: {}, responsive: {} } },
    { type: 'BusinessSection', props: { id: 'pharmacy', title: 'ناقصك إيه من الصيدلية ؟', subtitle: 'اختيارات قريبة وسريعة وقت ما تحتاج', variant: 'pharmacy', limit: 4, showLink: true, layout: 'grid', tone: 'soft', style: {}, responsive: {} } },
    { type: 'BusinessSection', props: { id: 'groceries', title: 'البيت محتاج إيه ؟', subtitle: 'مقاضيك من غير لف كتير', variant: 'groceries', limit: 4, showLink: true, layout: 'grid', tone: 'soft', style: {}, responsive: {} } },
    { type: 'BusinessSection', props: { id: 'delivery', title: 'الطلب هيطير إزاي ؟', subtitle: 'مكاتب توصيل حسب نطاق التغطية', variant: 'delivery', limit: 4, showLink: true, layout: 'grid', tone: 'soft', style: {}, responsive: {} } },
    { type: 'StickerCloud', props: { id: 'stickers', density: 'calm', opacity: 0.14, speed: 'slow', icons: ['star', 'cart', 'pill', 'box', 'store', 'spark', 'smile'], spread: 100 } },
  ],
}
