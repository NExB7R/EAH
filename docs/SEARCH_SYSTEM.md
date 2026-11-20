# EAH — Search System

> آخر تحديث: 2026-11-20

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

الملفات (بعد v6):
- lib/types/phone-search.ts — النوع المشترك
- lib/actions/phone-search.ts — Server Action
- components/explore/phone-result-card.tsx — بطاقة النتيجة
- Migration: docs/migrations/2026-11-11-phone-search-v6-part{1,2}.sql
- **حُذف**: app/admin/search/phone/ + lib/data/phone-search.ts (مهجور)

**الاستخدام:** مدمج في /explore تلقائيًا عند 11 رقم

RPC: search_customer_by_phone(p_phone text) — role-aware:
- الأدمن (super_admin): مسار SQL الحالي يرجع بيانات كاملة، ومنها الهاتف، قبل تطبيق phone_lookup_mode على المستخدم العادي.
- العميل (`customer`) أو التاجر (`merchant`) المسجل: يخضع لإعداد phone_lookup_mode:
  - full: الاسم حسب display_name_mode، الصورة حسب hide_avatar، النبذة، الدور، بيانات المصداقية، وعدّادات التعليقات/التقييمات حسب hide_comments وhide_reviews.
  - trust_only: بيانات المصداقية والتحقق فقط، من غير هوية.
  - anonymous: يخفي الهوية ويعرض أقل قدر من بيانات الحساب والنشاط المرتبط.
- Rate limit داخل RPC: 10/ساعة و30/24 ساعة للحساب العادي؛ الأدمن مستثنى.

Privacy: profiles.phone_lookup_mode (full / trust_only / anonymous).
Audit: phone_search_log (searcher_id, searched_phone_hash, found).

ملاحظة أمنية قبل الإطلاق:
- سجل البحث يخزن md5 للرقم من غير salt؛ ده لا يُعتبر إخفاءً آمنًا لأن نطاق أرقام الهاتف محدود ويمكن تخمينه. يلزم استبداله ببصمة HMAC بمفتاح سري محفوظ في قاعدة البيانات قبل الاعتماد على السجل كبيانات مجهولة.
- تعليق Migration v6 يقول إن الأدمن يتبع إعداد الخصوصية، لكن مسار الأدمن في جسم الدالة يرجع بيانات كاملة قبل فحص phone_lookup_mode. القرار ده متعارض ويحتاج حسمًا واختبارًا واضحًا قبل الإطلاق.

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
