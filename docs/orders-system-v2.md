# Orders System v2 — Documentation

> نظام الطلبات الكامل — مبني 2026-10-23. **مكتمل 100%.**

## المبدأ

- **المنصة = مصدر الحقيقة.** كل طلب، كل رد فعل، كل تقييم = صف في DB.
- **البايع يوافق/يرفض داخل المنصة** (مش على واتساب).
- **مفيش auto-accept** — كل طلب يحتاج قرار يدوي.
- **كل رد مسجّل** في `order_reactions`.

---

## Migrations المطبقة

| Migration | التاريخ | المحتوى |
|---|---|---|
| `2026-10-23-orders-v2-recovery.sql` | 2026-10-23 | 3 جداول + 20 عمود + RLS + triggers |
| `2026-10-23-orders-rls-read.sql` | 2026-10-23 | mos_select_authenticated + branches_select_authenticated |
| `2026-10-23-profiles-phone.sql` | 2026-10-23 | profiles.phone (prefill customer) |
| `2026-10-23-business-rating-trigger.sql` | 2026-10-23 | rating_avg + rating_count auto-sync |
| `2026-10-23-drop-empty-tables.sql` | 2026-10-23 | حذف 3 جداول فاضية (business_commissions/live_page_sessions/rate_limits) |

---

## الجداول

### `order_requests` (توسعة 20 عمود)
- Core: `delivery_address`, `payment_method`, `payment_reference`, `secondary_phone`, `attachments`
- Timing: `deadline_at`, `accepted_at`, `delivered_at`, `expected_delivery_at`, `expired_at`
- Feedback: `feedback_due_at`, `feedback_sent_at`, `feedback_reminder_at`, `feedback_reminder_sent_at`, `feedback_rating`, `feedback_text`, `feedback_issue_type`
- Misc: `snoozed_until`

### `merchant_order_settings` (جديد)
- `orders_enabled` (admin-only toggle)
- `deadline_minutes` (5-60, وقت الرد)
- `delivery_eta_minutes` (15-240, وقت التسليم)
- `offline_mode` + `offline_until` (توقف مؤقت)
- `missed_count_today` / `missed_count_week` (recomputed from truth)
- `suspended_until` + `suspension_reason` (10/week → 24h auto)
- `orders_enabled_at` / `orders_disabled_at`

### `order_reactions` (جديد — immutable audit)
- `actor_type` (customer/merchant/system/admin)
- `action` (created/viewed/accepted/rejected/snoozed/expired/delivered/feedback_submitted)
- `metadata` (jsonb)

### `customer_order_stats` (جديد)
- `total_orders`, `successful_orders`, `cancelled_orders`, `no_show_count`
- `total_spent_egp`, `is_vip` (5+ successful)

---

## RLS

| Table | SELECT | INSERT | UPDATE |
|---|---|---|---|
| `order_requests` | customer + owner + admin | customer (self) | owner + admin |
| `merchant_order_settings` | owner + authenticated (read for gate) + admin | admin | owner (except orders_enabled) + admin |
| `order_reactions` | related (customer/owner/admin) | related | — (immutable) |
| `customer_order_stats` | own + admin | trigger | trigger |

---

## Triggers

1. **`trg_prevent_toggle_orders_enabled`** — يمنع البايع من تغيير `orders_enabled`
2. **`trg_customer_stats_insert`** — يحدّث `customer_order_stats.total_orders`
3. **`trg_customer_stats_delivered`** — يحدّث `successful_orders` + `is_vip`
4. **`trg_update_business_rating`** — syncs `businesses.rating_avg/count` عند feedback

---

## Flow

### Customer
1. صفحة النشاط → "اطلب الآن" → modal (text/audio/images + payment)
2. review → confirm → submit
3. auto-open WhatsApp مع ملخص للتواصل
4. `/account/orders` → tracking + ETA
5. بعد `feedback_due_at` (delivered + 1h) → "قيّم الطلب"
6. rating + issue_type + comment → trigger يحدّث business aggregate

### Merchant
1. Push notification (deep-link `?order=X`)
2. `/merchant/orders` → mobile-first cards
3. اقبل → "بيتحضّر" → "في الطريق" → "اتسلّم"
4. عند الانتقال لـ delivered → `feedback_due_at` = now + 1h
5. لو ما ردش خلال deadline → auto-expire (lazy)
6. 10 misses/week → suspend 24h

### Admin
1. `/admin/businesses/[id]` → "تفعيل الاستلام" (ETA + deadline)
2. `/admin/orders` → stats + filters + extend/cancel
3. عند الإيقاف → summary report تلقائي
4. `/admin` dashboard → order flow section

---

## Auto-flow (lazy، بدون cron)

- `autoDeliverDueOrders()` — orders past `expected_delivery_at` → delivered
- `expireStaleOrders()` — orders past `deadline_at` → expired + suspension
- `sendFeedbackReminders()` — +30m بعد feedback_due → reminder واحد
- بيتنادى في: `/admin`, `/admin/orders`, `/merchant/orders`, `/account/orders`

---

## Bugs اتصلحت أثناء المراجعة

1. `accepted_at` missing → avg_response_min always null
2. WhatsApp phone normalization (0/20/+20)
3. Duplicate settings query
4. Admin revalidate paths missing
5. Race conditions → status guards + reaction dedupe
6. `missed_count_week` drift → recomputed from truth
7. Suspension not triggered → auto
8. Expiry notifications missing
9. Feedback gate bypass → server-side check
10. Business rating via trigger (RLS-safe)

---

## Push infra

- `lib/push/server.ts` — web-push
- `lib/push/client.ts` — subscribe
- `/api/push/subscribe` — upsert
- `app/sw.ts` — push event + notification click
- VAPID keys في env

**E2E**: يحتاج customer يعمل subscribe من المتصفح.

---

## Non-goals (deferred)

- Snooze (5 min once/order) — designed, not built
- Canned responses — designed, not built
- WhatsApp Business API — يحتاج Meta verification
- Payment gateway — cash/instapay/wallet فقط
- Multi-item cart — items = نص حر
