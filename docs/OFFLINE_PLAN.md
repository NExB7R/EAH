# EAH — Offline-First Plan

**آخر تحديث:** 2026-11-17
**الحالة:** قيد التنفيذ — 5 مراحل

---

## الرؤية

المنصة تعمل offline عادي — لا صفحة "أنت offline".
القراءة: من cache (فوري)
الكتابة: queue في IndexedDB → flush عند عودة الشبكة (بعد موافقة المستخدم)

---

## المراحل

### Phase 1 — Read-Only (30 دقيقة)
- `app/sw.ts`: إضافة runtimeCaching (HTML, assets, API)
- حذف `fallbacks.entries` (المرتبط بـ /offline المحذوف)
- الاختبار: DevTools → Offline → الصفحة تفتح

### Phase 2 — Write Queue (45 دقيقة)
- `lib/offline/db.ts`: IndexedDB wrapper
- `lib/offline/queue.ts`: add/peek/remove
- `lib/offline/sync.ts`: flush logic
- `useOfflineQueue()` hook
- أول Action: favorites (الأبسط)

### Phase 3 — UX (45 دقيقة)
- `OfflineBadge` (موجود — ربط بالـ queue)
- `SyncPrompt` (modal عند reconnect)
- `PendingIndicator` (في الهيدر)

### Phase 4 — التكامل مع Home + Pages (30 دقيقة)
- **Home:** قسم "اشتغل offline" في intro
- **`/explore`:** badge "محفوظ offline" على البطاقات
- **`/business/[slug]`:** "متاح offline" indicator
- **`/account`:** "3 تغييرات في الانتظار"

### Phase 5 — Actions (تدريجي)
1. favorites (الأول)
2. contact reveal
3. review submit
4. order request

---

## Actions القابلة للـ Queue

| Action | Idempotent؟ | تعقيد | الحالة |
|---|---|---|---|
| favorite.add/remove | ✅ | سهل | Phase 2 |
| contact.reveal | ⚠️ (يكشف بيانات) | متوسط | Phase 5 |
| review.submit | ✅ | متوسط | Phase 5 |
| order.request | ❌ (يحتاج availability) | معقد | Phase 5 |

---

## Tech Stack

- **Cache:** Workbox (via Serwist v9) — موجود
- **IndexedDB:** Native API (لا مكتبة خارجية)
- **Background Sync:** Service Worker API (موجود في sw.ts)
- **UI:** React components (بدون مكتبات)

---

## المكونات

### موجود
- `app/sw.ts` — Service Worker
- `components/sw-register.tsx` — Registrator
- `components/offline-badge.tsx` — Badge (يحتاج ربط)
- `next.config.ts` — `cacheOnNavigation: true`

### جديد
- `lib/offline/db.ts`
- `lib/offline/queue.ts`
- `lib/offline/sync.ts`
- `lib/hooks/use-offline-queue.ts`
- `components/offline/sync-prompt.tsx`
- `components/offline/pending-indicator.tsx`

---

## قواعد ثابتة

1. **لا صفحة offline** — المنصة تعمل عادي
2. **Queue في IndexedDB** — يبقى بعد refresh
3. **Sync بعد موافقة المستخدم** — لا flush تلقائي بدون إشعار
4. **Retry مع exponential backoff** — 3 محاولات
5. **Idempotent actions فقط** في queue (ما عدا contact.reveal)
6. **كل action له timeout** (10s) — لا يعلق
7. **البيانات الحساسة** — لا تُخزَّن في cache (تفاصيل الدفع، tokens)

---

## الاختبار

### Phase 1
- [ ] افتح /explore → Offline → refresh → الصفحة تفتح
- [ ] افتح /business/[slug] → Offline → refresh → تفتح
- [ ] Offline → navigate → assets تحمّل

### Phase 2
- [ ] Offline → اضغط favorite → badge "في الانتظار"
- [ ] Online → badge "متصل — مزامنة" → اضغط → flush
- [ ] Supabase: favorite محفوظ

### Phase 3
- [ ] Offline → 3 favorites → "3 تغييرات في الانتظار"
- [ ] Online → modal يظهر → [مزامنة] → flush
- [ ] Modal [لاحقًا] → يبقى في queue

### Phase 4
- [ ] Home → يذكر offline في قسم
- [ ] /explore → badge "offline" على البطاقات المحفوظة
- [ ] /account → عدد التغييرات

---

## الحالة

- [ ] Phase 1 — Read-only
- [ ] Phase 2 — Write queue
- [ ] Phase 3 — UX
- [ ] Phase 4 — Home + Pages
- [ ] Phase 5 — Actions

**مرجع:** `docs/RULES.md` + `docs/COMMON_AI_MISTAKES.md`
