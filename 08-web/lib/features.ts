export type FeatureKey =
  | 'whatsapp_orders'   // استقبال أوردرات واتساب
  | 'featured_badge'    // شارة مميز
  | 'priority_ranking'  // أولوية ترتيب
  | 'gallery'           // معرض صور
  | 'analytics'         // إحصائيات
  | 'qr_print'          // QR للطباعة
  | 'offers_gallery'    // معرض العروض
  | 'priority_support'  // أولوية دعم

export type Feature = {
  key: FeatureKey
  label: string
  emoji: string
  desc: string
  category: 'orders' | 'visibility' | 'content' | 'insights'
}

export const FEATURES: Feature[] = [
  { key: 'whatsapp_orders',  label: 'استقبال أوردرات على واتساب', emoji: '', desc: 'العميل يبعت أوردر ويوصلك على واتساب مباشر', category: 'orders' },
  { key: 'featured_badge',   label: 'شارة "مميز"',                 emoji: '', desc: 'تظهر على كارد النشاط وفي نتائج البحث', category: 'visibility' },
  { key: 'priority_ranking', label: 'أولوية في الترتيب',          emoji: '', desc: 'نشاطك يظهر قبل الباقي',                 category: 'visibility' },
  { key: 'gallery',          label: 'معرض صور',                    emoji: '📷', desc: 'رفع صور متعددة وتظهر في الكارد',       category: 'content' },
  { key: 'offers_gallery',   label: 'معرض عروض',                   emoji: '', desc: 'عروض غير محدودة على صفحتك',            category: 'content' },
  { key: 'qr_print',         label: 'QR للطباعة',                  emoji: '', desc: 'كود QR جاهز للطباعة على الفاتورة',     category: 'content' },
  { key: 'analytics',        label: 'تحليلات النشاط',             emoji: '', desc: 'مشاهدات، ضغطات، وكشف أرقام',           category: 'insights' },
  { key: 'priority_support', label: 'أولوية دعم',                  emoji: '', desc: 'رد أسرع من الفريق',                     category: 'insights' },
]

export const FEATURE_CATEGORY_LABEL: Record<string, string> = {
  orders: 'الأوردرات',
  visibility: '👁 الظهور',
  content: ' المحتوى',
  insights: ' البيانات',
}
