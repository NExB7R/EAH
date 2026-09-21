# EAH — Live State

**آخر تحديث:** 2026-09-21
**Branch:** ui-onlook
**Commit:** 182fc62

---

## ✅ اللي اتعمل مؤخراً

### تنظيف (Cleanup)
- ✅ شيل **ماركت** من كل الـ UI (5+ ملفات)
- ✅ شيل **emoji** من كل الـ UI (10+ ملفات)
- ✅ البوت (`smart-bot`) — مش مستخدم، **مؤجل**
- ✅ `Cairo_Play` → `Cairo` (شيل النقط الملونة من العناوين)
- ✅ نقط `•` → دايرة ناعمة (advertise/legal/social)

### Features جديدة
- ✅ **About link** في الهيدر (جنب search)
- ✅ **AboutTeaser** section في الهوم
- ✅ **AI_CONTRACT.md** + **SACRED.md** + **AI_START_HERE.md**

### ستايل 2026
- ✅ **aliases** للـ design tokens (توافق `--eah-*` مع `--r-*/--sp-*/--c-*`)
- ✅ **gradient ناعم** على h1/h2/h3 (بدل الصارخ)
- ✅ **shadows ناعمة** على:
  - `home-hero.css`
  - `section-slider-v2.css`
  - `explore-card-v5.css`
  - `visitor-value.css`

---

## 🔄 Cache Layer

| Function | Cache | revalidate | tags |
|----------|-------|------------|------|
| `getPublishedBusinesses(50)` | ✅ | 300s | `businesses` |
| `getActiveAdForSlot('home_banner')` | ✅ | 120s | `ads` |
| `loadUserProfileTags()` | ❌ | — | — |

---

## 📋 Features الأساسية (مش تتشالش)

- 3 فئات: **مطاعم، صيدليات، توصيل**
- Home: hero + sliders + visitor value + about teaser
- Business: hero + branches + reviews + map
- Admin: shell + businesses + reports + audit
- Merchant: dashboard + reports + partners + branches

---

## 🚫 ممنوع منعاً باتاً

- تعديل `unstable_cache` بدون إذن
- شيل features "لأنها مش مستخدمة"
- تعديل ملفات `SACRED.md` بدون تصريح
- commit بدون typecheck
- deploy بدون أمر صريح
