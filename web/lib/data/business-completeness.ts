// ═══════════════════════════════════════════════════════════
// EAH — Business Completeness (2026-11-09)
// حسابات جاهزية النشاط (نسبة + checklist)
// ═══════════════════════════════════════════════════════════

export type CompletenessItem = {
  id: string
  label: string
  weight: number
  done: boolean
  hint?: string
}

export type CompletenessResult = {
  percent: number
  grade: 'excellent' | 'good' | 'fair' | 'poor'
  missing: CompletenessItem[]
  done: CompletenessItem[]
  totalItems: number
  doneCount: number
}

type BusinessData = {
  name: string
  business_type: string
  description: string | null
  hook: string | null
  area: string | null
  city: string | null
  address_text: string | null
  latitude: number | null
  longitude: number | null
  logo_url: string | null
  cover_image_url: string | null
  working_hours: Record<string, unknown> | null
  is_verified: boolean
  is_published: boolean
  is_open: boolean
  accepts_orders: boolean
  accepts_whatsapp_orders: boolean
  branches_count: number
  offers_count: number
  rating_count: number
}

export function computeBusinessCompleteness(data: BusinessData): CompletenessResult {
  const items: CompletenessItem[] = [
    // الأساسيات (20)
    { id: 'name', label: 'اسم النشاط', weight: 5, done: data.name.trim().length >= 2 },
    { id: 'type', label: 'نوع النشاط', weight: 5, done: !!data.business_type },
    { id: 'description', label: 'وصف النشاط', weight: 5, done: !!(data.description?.trim() || data.hook?.trim()) },
    { id: 'published', label: 'النشر', weight: 5, done: data.is_published },

    // الموقع (15)
    { id: 'area', label: 'المنطقة', weight: 5, done: !!(data.area || data.city) },
    { id: 'address', label: 'العنوان التفصيلي', weight: 5, done: !!data.address_text?.trim() },
    { id: 'coords', label: 'الإحداثيات (خريطة)', weight: 5, done: data.latitude !== null && data.longitude !== null },

    // الصور (25) — الأهم للانطباع الأول
    { id: 'logo', label: 'شعار النشاط', weight: 10, done: !!data.logo_url, hint: 'ارفعه من صفحة التعديل' },
    { id: 'cover', label: 'صورة الغلاف', weight: 15, done: !!data.cover_image_url, hint: 'صورة كبيرة تظهر فوق' },

    // الساعات (10)
    { id: 'hours', label: 'ساعات العمل', weight: 10, done: !!data.working_hours && Object.keys(data.working_hours).length > 0 },

    // الثقة (10)
    { id: 'verified', label: 'موثّق من الإدارة', weight: 5, done: data.is_verified },
    { id: 'branches', label: 'فرع أساسي', weight: 5, done: data.branches_count > 0 },

    // التجارة (20)
    { id: 'orders', label: 'يستقبل طلبات (أونلاين أو واتساب)', weight: 10, done: data.accepts_orders || data.accepts_whatsapp_orders },
    { id: 'offers', label: 'عرض واحد على الأقل', weight: 5, done: data.offers_count > 0 },
    { id: 'reviews', label: 'تقييم واحد على الأقل', weight: 5, done: data.rating_count > 0 },
  ]

  const totalWeight = items.reduce((s, i) => s + i.weight, 0)
  const earnedWeight = items.filter((i) => i.done).reduce((s, i) => s + i.weight, 0)
  const percent = Math.round((earnedWeight / totalWeight) * 100)

  let grade: CompletenessResult['grade']
  if (percent >= 90) grade = 'excellent'
  else if (percent >= 70) grade = 'good'
  else if (percent >= 50) grade = 'fair'
  else grade = 'poor'

  return {
    percent,
    grade,
    missing: items.filter((i) => !i.done),
    done: items.filter((i) => i.done),
    totalItems: items.length,
    doneCount: items.filter((i) => i.done).length,
  }
}

export function getGradeLabel(grade: CompletenessResult['grade']): { label: string; color: string } {
  switch (grade) {
    case 'excellent':
      return { label: 'مكتمل', color: '#55e7d1' }
    case 'good':
      return { label: 'جيد', color: '#a3f5dc' }
    case 'fair':
      return { label: 'ناقص', color: '#facc15' }
    case 'poor':
      return { label: 'ضعيف', color: '#ef4444' }
  }
}
