import type { BusinessType } from '@/lib/data/businesses'
import { normalizeArabic } from './normalize'

// ═══════════════════════════════════════════════════════════
// EAH — Synonyms Dictionary (Egyptian Dialect)
// ═══════════════════════════════════════════════════════════

// كلمات مفتاحية لكل نوع
const TYPE_KEYWORDS: Record<BusinessType, string[]> = {
  restaurant: [
    'اكل', 'أكل', 'ماكولات', 'مطعم', 'مطاعم', 'فطار', 'فطور', 'غدا', 'غداء',
    'عشا', 'عشاء', 'جوعان', 'جعان', 'كشري', 'فول', 'طعميه', 'فلافل', 'شاورما',
    'بيتزا', 'برجر', 'ساندوتش', 'مشويات', 'فراخ', 'لحمه', 'سمك', 'كبده',
    'حواوشي', 'فتة', 'ملوخيه', 'باميه', 'محشي', 'كفته', 'رز', 'مكرونه',
    'حلويات', 'كنافه', 'بسبوسه', 'كيك', 'ايس كريم', 'قهوه', 'كافيه', 'شاي',
    'عصير', 'مشروبات', 'حلواني', 'فطير', 'فطائر', 'معجنات', 'كرواسون',
  ],
  pharmacy: [
    'دوا', 'دواء', 'علاج', 'صيدليه', 'صيدليات', 'عيان', 'مريض', 'تعبان',
    'وجع', 'ألم', 'الم', 'صداع', 'سخونيه', 'حراره', 'برد', 'كحه', 'مستلزمات طبيه',
    'فيتامين', 'شاش', 'بلاستر', 'مطهر', 'كمامات', 'ماسك',
  ],
  supermarket: [
    'بقاله', 'سوبر ماركت', 'ماركت', 'تسوق', 'خضار', 'فاكهه', 'فاكهة', 'لحمه',
    'فراخ', 'سمك', 'جزاره', 'جزار', 'عيش', 'خبز', 'لبن', 'جبن', 'بيض',
    'زيت', 'سكر', 'رز', 'مكرونه', 'معلبات', 'مياه', 'مشروبات غازيه', 'شيبسي',
    'بسكوت', 'شوكولاته', 'حفاضات', 'منظفات', 'صابون',
  ],
  delivery_office: [
    'توصيل', 'دليفري', 'طلب', 'اوردر', 'طلبيه', 'يودي', 'يجيب', 'يوصل',
    'شحن', 'ارسال', 'ارسل', 'بعت', 'مندوب', 'سواق', 'توصيل طلبات',
  ],
  misc: [
    'خدمات', 'متنوع', 'اخري', 'اخرى', 'حاجات', 'مستلزمات', 'ورشه', 'نجار',
    'سباك', 'كهربائي', 'حداد', 'مغسله', 'كوفير', 'حلاق', 'جيم', 'نادي',
    'مكتبه', 'ادوات', 'هدايا', 'موبايلات', 'كمبيوتر', 'الكترونيات', 'ملابس',
  ],
}

// خريطة الكلمة → النوع
const KEYWORD_TO_TYPE: Map<string, BusinessType> = new Map()

for (const [type, keywords] of Object.entries(TYPE_KEYWORDS)) {
  for (const kw of keywords) {
    KEYWORD_TO_TYPE.set(normalizeArabic(kw), type as BusinessType)
  }
}

// ═══════════════════════════════════════════════════════════
// استخراج الأنواع من query (بحث ذكي)
// ═══════════════════════════════════════════════════════════
export function extractTypes(query: string): BusinessType[] {
  const normalized = normalizeArabic(query)
  if (!normalized) return []

  const words = normalized.split(' ').filter(Boolean)
  const types = new Set<BusinessType>()

  // 1. كل كلمة لوحدها
  for (const word of words) {
    const type = KEYWORD_TO_TYPE.get(word)
    if (type) types.add(type)
  }

  // 2. الجملة كاملة (لو فيها مسافات)
  if (words.length > 1) {
    const fullType = KEYWORD_TO_TYPE.get(normalized)
    if (fullType) types.add(fullType)
  }

  return Array.from(types)
}
