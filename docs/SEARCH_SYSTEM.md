# EAH — Search System

> آخر تحديث: 2026-11-11

---

## نظرة عامة

نظام بحث ذكي يفهم العامية المصرية، يصحح الأخطاء، ويكتشف النية.

المكونات:

- lib/search/normalize.ts — تطبيع عربي (تشكيل، همزات، أرقام)
- lib/search/synonyms.ts — قاموس 200+ كلمة مصرية
- lib/search/index.ts — محرك البحث (Levenshtein + fuzzy)
- lib/search/filters.ts — فلاتر ديناميكية (12 نوع)
- lib/search/history.ts — سجل البحث (localStorage)
- lib/search/online-orders.ts — تصفية الطلبات الأونلاين

---

## كيف يعمل البحث

### 1. التطبيع (normalizeArabic)

مطعم البركة → مطعم البركه
أكل → اكل
١٢٣ → 123

### 2. استخراج النوع (extractTypes)

عايز أكل → ['restaurant']
صيدلية → ['pharmacy']

### 3. المطابقة (smartSearch)

بالترتيب حسب الأولوية:
1. الاسم (أعلى)
2. الهوك
3. المنطقة
4. الوصف
5. النوع

### 4. التسامح مع الأخطاء (Levenshtein)

مطعم البركه ≈ مطعم البركة → 0.9
مطعم البرك ≈ مطعم البركة → 0.5

### 5. الترتيب النهائي

- relevance (افتراضي عند البحث)
- distance (لو GPS متاح)
- quality (reputation score)
- newest / rating / trust

---

## الفلاتر (12 نوع)

type Filters = {
  types: BusinessType[]
  verifiedOnly: boolean
  area: string | null
  openNow: boolean
  online: boolean
  hasOffers: boolean
  isNew: boolean
  minRating: number | null
  maxDistanceMeters: number | null
  userLocation: LatLng | null
  sort: SortOption
}

كل الفلاتر في URL params — قابلة للمشاركة:

/explore?q=مطعم&open=1&type=restaurant&sort=distance

---

## Search History

lib/search/history.ts — localStorage (eah-search-history):
- آخر 10 عمليات بحث
- getHistory(), addToHistory(), removeFromHistory(), clearHistory()

TODO: ربط getHistory() في ExploreSearch component (غير مربوط حاليا).

---

## Phone Search (بحث بالرقم)

الملفات:
- lib/types/phone-search.ts — النوع المشترك
- lib/actions/phone-search.ts — Server Action
- app/admin/search/phone/phone-search-client.tsx — UI
- Migration: docs/migrations/2026-11-11-phone-search-v2.sql

RPC: search_customer_by_phone(p_phone text) — role-aware:
- super_admin: كل شيء (هاتف، بريد، صلاحيات)
- مستخدم authenticated: trust_score + tier + شارات فقط
- Rate limit: 10/ساعة، 30/يوم (غير أدمن)

Privacy: profiles.allow_phone_lookup (default true)
Audit: phone_search_log (searcher_id, hash, found)

---

## Command Palette

- lib/command-palette/commands.ts — 246 سطر، 30+ أمر
- components/ui/command-palette.tsx — UI (Ctrl+K)

TODO: ربط phone search كأمر ديناميكي (عند كتابة 11 رقم).

---

## AI Widget

- components/ai-widget.tsx — UI
- app/api/ai/chat/route.ts — endpoint

TODO: دمج phone search في AI (عند السؤال: مين صاحب رقم 010...).

---

## TODO (للمستقبل)

1. Search History UI في ExploreSearch
2. Phone search في command palette (عند 11 رقم)
3. Phone search في AI widget (intent detection)
4. توسيع synonyms لكل الفئات (حاليا restaurant فقط غني)
5. Fuzzy لأسماء المناطق (شبين ↔ شبين القناطر)
6. Search analytics (أكثر الكلمات، معدل النجاح)

---

## الاختبار

npx vitest run lib/search/index.test.ts
npx vitest run lib/search/filters.test.ts
