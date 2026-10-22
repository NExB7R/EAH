// ═══════════════════════════════════════════════════════════
// EAH — Review Dimensions Catalog (2026)
// كل نشاط له أبعاد مختلفة حسب النوع + subcategory
// ═══════════════════════════════════════════════════════════

import type { BusinessType } from '@/lib/data/businesses'

export type DimensionKey =
  | 'taste'
  | 'cleanliness'
  | 'service'
  | 'price'
  | 'speed'
  | 'freshness'
  | 'variety'
  | 'availability'
  | 'quality'
  | 'reliability'
  | 'atmosphere'
  | 'presentation'
  | 'experience'

export type Dimension = {
  key: DimensionKey
  label: string
  weight: number // 0-1
}

// ─── مكتبة الأسماء العربية ───
export const DIMENSION_LABELS: Record<DimensionKey, string> = {
  taste: 'الطعم',
  cleanliness: 'النظافة',
  service: 'الخدمة',
  price: 'السعر',
  speed: 'السرعة',
  freshness: 'الطزاجة',
  variety: 'التنوع',
  availability: 'التوفر',
  quality: 'الجودة',
  reliability: 'الالتزام',
  atmosphere: 'الجو',
  presentation: 'التقديم',
  experience: 'التجربة',
}

// ─── المجموعات الجاهزة ───
const G = {
  fullMeal: [
    { key: 'taste' as const, weight: 0.35 },
    { key: 'cleanliness' as const, weight: 0.15 },
    { key: 'service' as const, weight: 0.2 },
    { key: 'price' as const, weight: 0.15 },
    { key: 'speed' as const, weight: 0.15 },
  ],
  bakery: [
    { key: 'taste' as const, weight: 0.4 },
    { key: 'freshness' as const, weight: 0.25 },
    { key: 'variety' as const, weight: 0.2 },
    { key: 'price' as const, weight: 0.15 },
  ],
  cafe: [
    { key: 'taste' as const, weight: 0.3 },
    { key: 'atmosphere' as const, weight: 0.25 },
    { key: 'service' as const, weight: 0.2 },
    { key: 'price' as const, weight: 0.15 },
    { key: 'presentation' as const, weight: 0.1 },
  ],
  dessert: [
    { key: 'taste' as const, weight: 0.35 },
    { key: 'presentation' as const, weight: 0.2 },
    { key: 'freshness' as const, weight: 0.2 },
    { key: 'service' as const, weight: 0.15 },
    { key: 'price' as const, weight: 0.1 },
  ],
  dairy: [
    { key: 'freshness' as const, weight: 0.35 },
    { key: 'quality' as const, weight: 0.3 },
    { key: 'price' as const, weight: 0.2 },
    { key: 'service' as const, weight: 0.15 },
  ],
  grocery: [
    { key: 'availability' as const, weight: 0.3 },
    { key: 'price' as const, weight: 0.3 },
    { key: 'cleanliness' as const, weight: 0.2 },
    { key: 'service' as const, weight: 0.2 },
  ],
  attar: [
    { key: 'quality' as const, weight: 0.35 },
    { key: 'variety' as const, weight: 0.25 },
    { key: 'price' as const, weight: 0.2 },
    { key: 'service' as const, weight: 0.2 },
  ],
  household: [
    { key: 'availability' as const, weight: 0.3 },
    { key: 'variety' as const, weight: 0.25 },
    { key: 'price' as const, weight: 0.3 },
    { key: 'service' as const, weight: 0.15 },
  ],
  poultry: [
    { key: 'freshness' as const, weight: 0.4 },
    { key: 'cleanliness' as const, weight: 0.25 },
    { key: 'price' as const, weight: 0.2 },
    { key: 'service' as const, weight: 0.15 },
  ],
  frozen: [
    { key: 'quality' as const, weight: 0.35 },
    { key: 'variety' as const, weight: 0.25 },
    { key: 'price' as const, weight: 0.25 },
    { key: 'service' as const, weight: 0.15 },
  ],
  bookstore: [
    { key: 'availability' as const, weight: 0.3 },
    { key: 'variety' as const, weight: 0.35 },
    { key: 'price' as const, weight: 0.2 },
    { key: 'service' as const, weight: 0.15 },
  ],
  pharmacy: [
    { key: 'availability' as const, weight: 0.3 },
    { key: 'speed' as const, weight: 0.3 },
    { key: 'price' as const, weight: 0.2 },
    { key: 'service' as const, weight: 0.2 },
  ],
  delivery: [
    { key: 'speed' as const, weight: 0.35 },
    { key: 'service' as const, weight: 0.25 },
    { key: 'price' as const, weight: 0.25 },
    { key: 'reliability' as const, weight: 0.15 },
  ],
  misc: [
    { key: 'quality' as const, weight: 0.35 },
    { key: 'price' as const, weight: 0.25 },
    { key: 'reliability' as const, weight: 0.2 },
    { key: 'experience' as const, weight: 0.2 },
  ],
}

// ─── ربط subcategory بالمجموعة ───
const SUBCATEGORY_MAP: Record<string, keyof typeof G> = {
  // restaurant
  مطعم: 'fullMeal',
  كشري: 'fullMeal',
  مشويات: 'fullMeal',
  بيتزا: 'fullMeal',
  فول: 'fullMeal',
  ساندوتشات: 'fullMeal',
  مخبوزات: 'bakery',
  حلواني: 'bakery',
  كافيه: 'cafe',
  قهوة: 'cafe',
  ديزيرت: 'dessert',
  'آيس كريم': 'dessert',
  'حلويات شرقية': 'dessert',
  ألبان: 'dairy',
  عصائر: 'dairy',
  'ميلك شيك': 'dairy',
  // retail
  ماركت: 'grocery',
  بقالة: 'grocery',
  عطارة: 'attar',
  منظفات: 'household',
  'مستلزمات منزلية': 'household',
  دواجن: 'poultry',
  أسماك: 'poultry',
  مجمدات: 'frozen',
  مكتبة: 'bookstore',
  'أدوات مدرسية': 'bookstore',
}

// ─── الدالة الرئيسية ───
export function getReviewDimensions(
  businessType: BusinessType,
  subcategory: string | null,
): Dimension[] {
  let group: keyof typeof G

  if (subcategory && SUBCATEGORY_MAP[subcategory]) {
    group = SUBCATEGORY_MAP[subcategory]!
  } else {
    switch (businessType) {
      case 'restaurant':
        group = 'fullMeal'
        break
      case 'pharmacy':
        group = 'pharmacy'
        break
      case 'delivery_office':
        group = 'delivery'
        break
        group = 'grocery'
        break
      default:
        group = 'misc'
    }
  }

  return G[group].map((d) => ({
    key: d.key,
    label: DIMENSION_LABELS[d.key],
    weight: d.weight,
  }))
}

// ─── حساب المتوسط المرجّح لتقييم ───
export function weightedScore(dimensions: Record<string, number>, catalog: Dimension[]): number {
  let total = 0
  let weightSum = 0
  for (const d of catalog) {
    const v = dimensions[d.key]
    if (typeof v === 'number' && v >= 1 && v <= 5) {
      total += v * d.weight
      weightSum += d.weight
    }
  }
  if (weightSum === 0) return 0
  return Math.round((total / weightSum) * 100) / 100
}

// ─── حساب جودة التقييم (0-100) ───
export function reviewQualityScore(comment: string, hasVerified: boolean): number {
  let score = 0
  const len = comment.trim().length
  if (len >= 20) score += 20
  if (len >= 50) score += 20
  if (len >= 150) score += 30
  if (hasVerified) score += 30
  return Math.min(100, score)
}
