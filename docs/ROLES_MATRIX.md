# EAH — ROLES MATRIX

> **المصدر الوحيد لمنطق الأدوار (§26).**
> أي قرار عن "مين يشوف إيه" → من الجدول ده.
> **آخر تحديث:** 2026-10-08

---

## 1. الأدوار (4)

| الدور | التعريف | المصدر |
|-------|---------|--------|
| **guest** | مش مسجل | `!session` |
| **customer** | مسجل بدون business | `profiles` + `!businesses` |
| **merchant** | عنده business على الأقل | `businesses.owner_profile_id` |
| **admin** | في `user_roles` | `user_roles.role` |

**الترتيب:** admin > merchant > customer > guest.

---

## 2. مصفوفة الوصول (Routes × Roles)

| Route | guest | customer | merchant | admin |
|-------|:-----:|:--------:|:--------:|:-----:|
| `/` الرئيسية | ✅ | ✅ | ✅ | ✅ |
| `/explore`, `/offers`, `/trends`, `/new`, `/featured`, `/nearby`, `/suggest` | ✅ | ✅ | ✅ | ✅ |
| `/businesses/[slug]` | ✅ | ✅ | ✅ | ✅ |
| `/find` | ✅ | ✅ | ✅ | ✅ |
| الصفحات العامة (about, terms...) | ✅ | ✅ | ✅ | ✅ |
| `/trust` | ✅ | ✅ | ✅ | ✅ |
| `/auth` | ✅ | ✅ | ✅ | 🚫 `/admin` |
| `/account/*` | ❌ `/auth` | ✅ | ✅ | 🚫 `/admin` |
| `/merchant/apply` | ❌ `/auth` | ✅ | 🚫 `/merchant` | 🚫 `/admin` |
| `/merchant/*` | ❌ `/auth` | 🚫 `/merchant/apply` | ✅ | 🚫 `/admin` |
| `/admin/*` | ❌ `/auth` | ❌ `/auth` | ❌ `/auth` | ✅ |
| `/notifications` | ❌ `/auth` | ✅ | ✅ | ✅ |

**الرموز:** ✅ مسموح · ❌ redirect للـ path

---

## 3. Header/Capsule

| العنصر | guest | customer | merchant | admin |
|--------|:-----:|:--------:|:--------:|:-----:|
| زر "ادخل بسرعة" | ✅ | ❌ | ❌ | ❌ |
| Avatar (صورة + اسم) | ❌ | ✅ | ✅ | ✅ ذهبي |
| Avatar → رابط | — | `/account` | `/account` | `/admin` |

---

## 4. Menu Drawer

**قسم "الحساب":** customer + merchant فقط
**قسم "الإدارة":** admin فقط
**قسم "التاجر":** merchant فقط

---

## 5. Sidebars

| Sidebar | من يشوفها |
|---------|-----------|
| `AccountSidebar` | customer + merchant |
| `MerchantSidebar` | merchant فقط |
| `AdminSidebar` | admin فقط |

---

## 6. المسؤوليات

| العملية | customer | merchant | admin |
|---------|:--------:|:--------:|:-----:|
| تعديل بياناته | ✅ | ✅ | ✅ في /admin/settings |
| رفع صورة بروفايل | ✅ | ✅ | ✅ |
| كتابة تقييم | ✅ | ✅ | 🚫 |
| إضافة نشاط | ❌ | ✅ apply | ✅ direct |
| تعديل نشاط | ❌ | ✅ بتاعه | ✅ أي واحد |
| إدارة مستخدمين | ❌ | ❌ | ✅ |

---

## 7. القواعد الذهبية

1. **قبل أي page جديدة** → اسأل: "أي دور؟" → شوف الجدول
2. **أي redirect** → من `getRedirectForRole()` — مش inline
3. **أي sidebar جديدة** → أضفها هنا الأول
4. **أي role check** → `getRoleContext()`
5. **`user_roles` مصدر الأدمن** — مش `profiles.role`

---

**المراجع:**
- `lib/auth/roles.ts`
- `proxy.ts`
- `SACRED.md §4`
