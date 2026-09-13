export type DemoBusiness = {
  businessId?: string
  name: string
  slug: string
  type: 'restaurant' | 'pharmacy' | 'supermarket' | 'delivery_office'
  area: string
  badge?: string
  vibe: string[]
  reason: string
  open: boolean
  featured?: boolean
  menu?: string[]
  hook?: string
  activeOffers?: number
}

export const demoBusinesses: DemoBusiness[] = [
  { name: 'مطبخ البلد', slug: 'matbakh-elbalad', type: 'restaurant', area: 'شبين القناطر', badge: 'مميز', vibe: ['مصري', 'غدا', 'اقتصادي'], reason: 'مناسب لميزانية الغدا وناس كتير حفظته', open: true, featured: true, menu: ['منيو الغدا', 'وجبات فردي', 'كومبو العيلة'] },
  { name: 'صيدلية الأمان', slug: 'sadalyet-alaman', type: 'pharmacy', area: 'شبين القناطر', badge: 'قريب منك', vibe: ['طوارئ', 'قريب', 'مفتوح'], reason: 'قريب منك ومفتوح دلوقتي', open: true },
  { name: 'سوبر ماركت البركة', slug: 'supermarket-elbaraka', type: 'supermarket', area: 'المنايل', badge: 'قريب', vibe: ['مقاضي', 'قريب', 'سريع'], reason: 'اختيار قريب للمقاضي السريعة', open: true },
  { name: 'مكتب توصيل سريع', slug: 'tasree-delivery', type: 'delivery_office', area: 'يغطي منطقتك', badge: 'تغطية قوية', vibe: ['توصيل', 'طرود', 'سريع'], reason: 'منطقة التغطية متوافقة مع منطقتك', open: true },
]
