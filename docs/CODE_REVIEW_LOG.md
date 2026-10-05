# EAH — CODE REVIEW LOG

> **قاعدة المالك (2026-10-05):** أثناء أي تطوير — سجّل أي مشكلة/ملاحظة + أفكار للتحسين.
> **التصنيفات:** 🔒 أمان | ⚡ سرعة | 🧠 وجيك | ✨ سلاسة | 🎨 تصميم

**آخر تحديث:** 2026-10-06

---

## ✅ تم حلها (Session 12 — 2026-10-05/06)

| # | المشكلة | الحل |
|---|---------|------|
| 1 | بحث الأنواع يتجاهل الاسم | Search v2: filter بالـ type ثم rank بالاسم |
| 2 | مفيش word-level search | tokenize + score لكل كلمة |
| 3 | مفيش Fuzzy matching | Levenshtein ≤ 2 |
| 4 | مفيش ترتيب ثانوي | is_open + trust + rating + distance |
| 5 | أرقام عربية غير مدعومة | ٠-٩ → 0-9 في normalize |
| 6 | مفيش limit parameter | Math.min(limit, 200) |
| 7 | normalizeArabic يتكرر | cachedNormalize |
| 8 | مفيش ترتيب حسب النية | detectIntent (quality/nearby/open_now) |
| 9 | تعارض body.overflow | OrderModal وحده يتحكم |
| 10 | cooldown logic خطير | regex دقيق (\\b429\\b + \\b5xx\\b + AbortError) |
| 11 | onClose غير مستقر | useCallback |
| 12 | limit في smartSearch | Math.min/max |
| 13 | overscroll في MenuSlider | overscroll-behavior: contain |
| 14 | admin/businesses زر موافقة ميت | Server Action + useTransition |
| 15 | مفيش رفض | rejectBusiness + reason + إشعار |
| 16 | مفيش إدارة المنشورين | Tabs (pending/published/rejected/all) |
| 17 | مفيش bulk actions | — (مؤجل — لا ضرورة حالياً) |
| 18 | description مقطوع | تفاصيل كاملة في الصفحة |
| 19 | مفيش بحث/فلترة | Tabs + بحث |
| 20 | <img> بدون optimization | (مؤجل — غير حرج) |

---

## 🔴 ملاحظات مفتوحة (مرتبة حسب الخطورة)

_(يُحدَّث باستمرار أثناء التطوير)_

---

## ⚠️ قواعد المراجعة

- أي مشكلة → تسجيل فوري هنا
- كل ملاحظة → 3 حاجات: المشكلة + الأثر + الحل المقترح
- المراجعة بتحصل أثناء التطوير، مش بعده

---

آخر تحديث: 2026-10-06
