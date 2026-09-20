# EAH — البنية الكاملة

> المرجع التقني. AI أو مطوّر يقراه عشان يفهم المشروع.

## 🗄️ قاعدة البيانات — الجداول الرئيسية

### profiles
بيانات المستخدم. مرتبط بـ auth.users.
| العمود | النوع | ملاحظة |
|---|---|---|
| id | uuid (PK) | = auth.users.id |
| display_name | text | NOT NULL |
| phone | text | من trigger |
| phone_e164 | text | E.164 format |
| gender | text | male/female/null |
| bio | text | اختياري |
| avatar_key | text | av1..av12 |
| avatar_url | text | رفع من cloudinary |
| trust_score | int | النقاط |
| streak_count | int | أيام متتالية |
| verified_at | timestamptz | التوثيق |
| banned_until | timestamptz | الحظر |

### user_roles
| user_id | uuid |
| role | app_role enum: customer/merchant/admin/super_admin |

### businesses
| العمود | ملاحظة |
|---|---|
| id, slug, name | معرّفات |
| business_type | restaurant/pharmacy/supermarket/delivery_office |
| area, city | المكان |
| is_open, is_featured, is_published | الحالة |
| working_hours | jsonb {sat: {open, close, closed}} |
| cover_image_url | الغلاف |
| hook, description, address_text | نصوص |
| latitude, longitude | إحداثيات |
| owner_profile_id | uuid المالك |
| accepts_whatsapp_orders | bool |

### business_media
الصور (كل نوع لوحده).
| business_id | uuid |
| media_type | 'logo' / 'cover' / 'gallery' / 'menu' |
| storage_path | URL |
| sort_order | int |

### business_contact_methods
| business_id | uuid |
| method_type | phone/whatsapp/facebook/instagram/website/email |
| value | text |
| is_primary | bool |

### business_food_categories
| business_id | uuid |
| category_key | pizza/grill/koshary/coffee... |

### business_reviews
| business_id, user_id | uuids |
| taste, value_for_money, speed, experience | smallint 1-5 |
| comment | text |
| status | 'approved' / 'pending' / 'rejected' |
| flagged_reason | text |
| merchant_reply, merchant_reply_at, merchant_reply_by | رد التاجر |

### notifications
| user_id | uuid |
| notification_type | welcome/review/reply/points... |
| title, body, deep_link | نصوص |
| read_at | timestamptz |

### favorites
| user_id, business_id | uuids |

### points_log
| user_id | uuid |
| delta | int |
| reason | text |
| balance_after | int |

---

## 🔌 API Routes

| المسار | الوظيفة |
|---|---|
| `/api/profile/update` | POST — يحفظ البروفايل (server client) |
| `/api/admin/upload` | POST — يرفع صورة لـ Cloudinary |
| `/api/reveal-contact` | POST — يكشف رقم (rate-limited) |
| `/api/reviews` | POST — يضيف تقييم |
| `/api/favorites` | POST/DELETE — toggle مفضلة |
| `/api/follows` | POST/DELETE — متابعة نشاط |
| `/api/push/subscribe` | POST — يشترك في Push |
| `/api/push/notify` | POST — يبعت Push |
| `/api/orders/notify` | POST — إشعار أوردر جديد |
| `/api/cron/subscription-check` | cron يومي 9ص |
| `/api/cron/trial-reminder` | cron 7ص/7م |
| `/api/cron/review-reminder` | cron |

---

## ⚙️ Triggers & Functions

### على auth.users
- `on_auth_user_created` → `handle_new_user()` — يضيف صف في profiles + user_roles
- `on_auth_user_phone_confirmed` → `sync_profile_phone_verified()`

### على business_reviews
- `reviews_auto_flag` (BEFORE INSERT/UPDATE comment) → `auto_flag_review()`
  - يفحص: روابط/أرقام/شتائم/حروف كبيرة
  - لو flag → status = 'pending'
  - ⚠️ بيستخدم `array_append()` مش `||`

### Functions مهمة
- `award_review_points(p_review_id)` — +10 نقاط لأول تقييم
- `award_daily_login()` — نقاط دخول يومي
- `reveal_contact(...)` — كشف أرقام مع rate limiting
- `get_business_view_stats(slugs[], days)` — views حقيقية
- `expire_old_subscriptions()` — انتهاء الاشتراكات

---

## 🔐 RLS — ملخص

| الجدول | سياسة |
|---|---|
| profiles | SELECT: public read؛ UPDATE: self only |
| user_roles | SELECT: public؛ INSERT/UPDATE: admin only |
| businesses | SELECT: is_published=true؛ UPDATE: owner or admin |
| business_media | SELECT: public؛ ALL: admin |
| business_reviews | SELECT: approved or self؛ INSERT: self؛ UPDATE: self |
| favorites | ALL: self only |
| notifications | SELECT: self only |

**private.is_admin()** — دالة SECURITY DEFINER بتشيك على super_admin.

---

## 📄 الصفحات الرئيسية

### عامة (زائر)
- `/` الرئيسية
- `/explore` اكتشاف + فلاتر
- `/offers`, `/trends`, `/new`, `/featured`
- `/businesses/[slug]` صفحة نشاط
- `/about`, `/contact`, `/pricing`, `/advertise`, `/terms`, `/privacy`, `/cookies`

### محمية (مستخدم)
- `/account` + `/account/edit` + `/account/points`, `/orders`, `/referral`, `/verify`, `/security`
- `/notifications`

### تاجر
- `/merchant` + الطلبات/العروض/الإعدادات

### أدمن
- `/admin` + `/admin/businesses`, `/admin/collect`, `/admin/users`, `/admin/points`

---

## 🎨 المكونات الأساسية

| المكوّن | الوظيفة |
|---|---|
| `floating-capsule.tsx` | الهيدر العائم |
| `site-footer.tsx` | الفوتر |
| `eah-logo.tsx` | اللوجو (تاج + EAH) |
| `page-logo.tsx` | لوجو الصفحات (نبض) |
| `business-hero.tsx` | هيرو النشاط (غلاف + لوجو + سلايدشو) |
| `business-quick-actions.tsx` | شريط (اتصال/واتساب/شارك/احفظ) |
| `business-gallery.tsx` | معرض صور + Lightbox |
| `business-menu.tsx` | منيو + Lightbox |
| `business-hours.tsx` | أوقات العمل |
| `business-reviews.tsx` | قائمة التقييمات |
| `review-form.tsx` | نموذج التقييم |
| `locked-content.tsx` | Gate للزوار |
| `explore-card-v5.tsx` | كارت flip (لوجو → منيو → صور) |
| `splash-screen.tsx` | شاشة تحميل |

---

## 🚦 الـ Gates (locked للمجهول)

- **صفحة النشاط**: العروض + الكوبونات + التواصل + الخريطة + التقييمات
- **الأرقام**: بتتكشف فقط لو مسجّل (API rate-limited)
- **التقييم**: لازم تسجيل

---

## ⚠️ مخاطر معروفة

1. **`proxy.ts` مش `middleware.ts`** (Next.js 16)
2. **`business_subscriptions.owner_id`** — فيه مشكلة
3. **Sentry CSP blocked** — غير حرج
4. **Vercel Hobby** — حد 100 deploy/يوم + بدون cron دقيق
5. **`auto_flag_review`** — استخدم `array_append()` دايماً

---

**لو محتاج تفاصيل أعمق — راجع الكود مباشرة.**
