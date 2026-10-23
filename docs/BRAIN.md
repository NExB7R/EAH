# EAH — BRAIN.md

> اقرأ ده الأول. الملف ده هو العقل.
> آخر تحديث: 2026-10-19

---

## 0. ليه الملف ده؟

BRAIN.md خلاصة SACRED + AI_CONTRACT + LESSONS. ممنوع تكتب كود قبل ما تقرأه + docs/CONTEXT_MAP.md.

---

## 1. الهوية (مقدسة)

### 1.1 الاسم والسلوغان

- الاسم: EAH
- السلوغان: "شبيك لبيك — كل حاجة حواليك"
- الجمهور: شبين القناطر والقرى حواليها
- الفكرة: توصّل الناس بأماكنهم المحلية — بحث ذكي باللهجة المصرية، طلب واتساب، بدون وسيط

### 1.2 الألوان

- بنفسجي أساسي: #9D4EDD
- بنفسجي نيون: #A855F7
- بنفسجي فاتح: #C77DFF
- ذهبي: #E8C79A
- Teal: #55E7D1 (نجاح فقط)
- Orange: #FDBA74 (ترند فقط)
- Red: #FCA5A5 (تحذير فقط)
- خلفية: #07020D

**ممنوع:** ألوان خارج القائمة، تدرجات جديدة، light mode.

### 1.3 الخطوط

- رئيسي: Cairo Variable
- عرض: Tajawal Variable
- ممنوع: Poppins/Inter/Roboto/أي خط تاني

### 1.4 الستايل

- Dark-only
- نيون ناعم (طبقة واحدة)
- بدون backdrop-filter على الكروت
- بدون animations مستمرة
- Transitions: 180-240ms ease-out
- الروح: Linear × Vercel × Stripe × Apple

---

## 2. المبادئ الثابتة

1. مجاني 100% للعميل
2. صفر عمولة على التاجر
3. رقم الموبايل ما يظهرش أبداً (reveal_contact فقط)
4. Verified ≠ مدفوع
5. بدون تتبع تسويقي
6. صفر بيانات وهمية

---

## 3. الستاك

- Frontend: Next.js 16 (App Router) + React 19
- Language: TypeScript strict
- Styling: CSS Modules
- Backend: Server Actions + Route Handlers
- DB: Supabase (Postgres + RLS + Realtime)
- Auth: Supabase Auth (phone → email .invalid)
- Storage: Cloudinary + Supabase Storage
- Cache: Upstash Redis
- Deploy: Vercel (iad1)
- PWA: Serwist
- Monitoring: system_errors + /admin/health

---

## 4. بنية المجلدات

```
web/
├── app/         # Routes (admin, merchant, account, api)
├── components/  # 200+ (ui/, admin/)
├── lib/         # data, validations, auth, supabase, hooks
└── docs/migrations/
```

**القاعدة:** lib/data ترجع بيانات فقط. components مش بتلمس DB.

---

## 5. أنماط الكود الإلزامية

### 5.1 Server Actions

كل action لازم:

1. use server في الأول
2. requireAdmin/requireMerchant/getUserSession
3. Zod schema للتحقق
4. Result type: { ok, error?, id?, affected? }
5. logAudit لكل تغيير
6. revalidatePath + revalidateTag

### 5.2 Server Components

```tsx
export const dynamic = "force-dynamic";

export default async function MyPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const data = await getData(params.q);
  return <ClientComponent data={data} />;
}
```

### 5.3 Client Components

```tsx
"use client";
import { useState, useTransition } from "react";

export default function MyClient({ data }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
}
```

### 5.4 URL-Driven Filters (إلزامي)

```tsx
const sp = useSearchParams();
const router = useRouter();
const pathname = usePathname();
router.replace(`${pathname}?${new URLSearchParams({ q }).toString()}`, {
  scroll: false,
});
```

السبب: bookmarkable + shareable + back/forward يعمل.

### 5.5 Optimistic UI

```tsx
const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
const visible = data.filter((d) => !removedIds.has(d.id));
```

---

## 6. الممنوعات المطلقة

### 6.1 في الكود

- any بدون تعليق موثّق
- @ts-ignore بدون سبب
- console.log في الإنتاج
- img بدون Cloudinary transforms
- unstable_cache جوه component
- createClient في public reads
- Emojis في UI (SVG فقط)
- تعديل Schema/SQL بدون سؤال
- npm run build محلي (SIGILL)
- Date.now() في render — استخدم useState(() => Date.now())
- setState متزامن في useEffect — نقل للـ event handler

### 6.2 في التصميم

- Animations مستمرة (infinite)
- backdrop-filter على الكروت
- will-change دائم
- ألوان خارج الهوية
- خطوط غير Cairo + Tajawal
- Light mode

### 6.3 في Git

- Secrets في commit
- Commit بدون tsc + eslint
- Commit type مش في [feat, fix, docs, style, refactor, perf, test, chore, ci, build, revert, sec]

---

## 7. ممنوعات Vibe Coding 2026-2027

أخطاء شائعة في مشاريع الـ AI — ممنوع تقع فيها:

1. any كوسيلة للنجاة — استخدم zod.safeParse
2. God Components (300+ سطر) — قسّم
3. Copy-Paste Duplication — نسختين = 3 أسطر، 3 نسخ = helper
4. Magic Strings — const enums
5. Server Data كله للـ client — ابعت IDs فقط
6. It Works بدون Testing — اختبر يدوياً على 320/768/1440
7. Fire and Forget — { error } = await supabase، شوفه
8. No Error Boundaries — error.tsx لكل route معقد
9. AI-Driven Sprawl — helpers في lib/utils/، مش الجذر
10. No Caching Strategy — revalidateTag معروف لكل tag
11. Hardcoded Values — const في lib/config
12. It Will Work Migrations — backup -> test -> deploy -> verify

---

## 8. دروس مستفادة

### 8.1 من 2026-09-25

- heredoc + عربي = كوارث — استخدم Python أو chunks صغيرة
- nano بيتقطع — استخدم Python أو VS Code
- CSP صارم بيكسر Next.js 16 — استخدم nonce

### 8.2 من 2026-10-17 (Admin Overhaul — 20 commit)

- Date.now() في render = خطأ React 19 — lazy useState
- setState في effect = cascading render — نقله للـ event
- regex markers للـ replace — re.sub() مع markers
- verify-before-replace — grep -c pattern الأول

### 8.3 من 2026-10-19 (Security + Wizard)

- page.tsx ممكن يكون مستورد الملف القديم — تحقق من الـ imports
- commitlint type enum محدود — sec: مش security:
- Supabase 2026 غيّر سلوك GRANTs — الجداول الجديدة لازم GRANT صريح
- GRANT في DO block بيحتاج جلسة postgres
- RLS policy violates != permission denied — الأول تمام، التاني GRANT ناقص
- heredoc + عربي + 200+ سطر = فشل مؤكد — قسّم لأجزاء 25 سطر
- code fences (3 backticks) بتقطع heredoc — استخدم Python أو chr(96)*3

---

## 9. Checklist كل Commit

```bash
cd ~/EAH/web
npx tsc --noEmit 2>&1 | head -10      # صفر
npx eslint . 2>&1 | head -10           # صفر
npx prettier --check '**/*.{ts,tsx,css}' 2>&1 | tail -5  # صفر

npx prettier --write <files>

cd ~/EAH
git add <files>
git commit -m 'type(scope): short description'
git push origin main
```

**Commit types:** feat | fix | sec | refactor | perf | docs | style | test | chore | ci | build | revert

---

## 10. Workflow لأي مهمة

1. اقرأ BRAIN.md + docs/CONTEXT_MAP.md
2. افحص الملفات — find, grep, cat
3. اكتب الخطة (3-5 أسطر)
4. ابعت الخطة للمالك — استنى يلا
5. نفّذ في chunks صغيرة
6. تحقق بعد كل ملف — wc -l + grep + tsc
7. اختبر يدوياً
8. Commit
9. حدّث SESSION_LOG.md لو كبيرة

---

## 11. أول 5 خطوات لأي شات جديد

1. اقرأ AI_PLAYBOOK.md + BRAIN.md + ERROR_REGISTER.md — 15 دقيقة
2. اقرأ docs/CONTEXT_MAP.md
3. اسأل المالك: إيه آخر commit؟ + إيه المهمة؟
4. شغّل git log --oneline -10
5. ابدأ: قرأت. جاهز. أنا فاهم EAH — Next 16 + React 19 + Supabase. آخر commit X. إيه المهمة؟

---

## 12. الملفات التفصيلية

| الملف                  | متى تقرأه               |
| ---------------------- | ----------------------- |
| docs/SACRED.md         | قبل أي تعديل هوية/تصميم |
| docs/AI_CONTRACT.md    | قبل أي كود              |
| docs/LESSONS.md        | قبل أي مهمة (فشل قديم)  |
| docs/MASTER_BRIEF.md   | الصورة الكاملة          |
| docs/CONTEXT_MAP.md    | إيه موجود؟              |
| docs/SESSION_LOG.md    | تاريخ العمل             |
| docs/PROGRESS.md       | حالة الميزات            |
| docs/CODE_STANDARDS.md | معايير الكود            |
| docs/DESIGN_SYSTEM.md  | تفاصيل بصرية            |
| docs/DATABASE_RULES.md | قبل تعديل DB            |

---

## 13. آخر 15 commit

```
ef1c1a7 fix(admin): wire page.tsx to NewBusinessWizard
2a0b135 sec: 5 fixes (cron/log-error/track-action/state-machine/email)
5901434 fix(admin): createBusiness matches wizard payload
db1f9fe fix(admin): add missing wizard step files
21da165 feat(admin): new business wizard (2026 redesign)
d86ed11 feat(admin): optimistic resolve in health
3c66077 feat(merchant): business edit rebuild
f57722a feat(merchant): ads stats + filter + optimistic cancel
f7218d5 feat(merchant): branches stats + search + filter + optimistic
0898add feat(merchant): offers stats + search + filters + optimistic
58ee803 feat(merchant): orders search + date filter + countdown
e59f5a0 chore(admin): remove unused imports (user detail)
2f1caad feat(admin): user detail page
2c3d37a feat(admin): real-time dashboard
5160a6f feat(admin): optimistic UI for bulk + moderation
```

---

## 14. جهات الاتصال

- المالك: NourEldin B7R
- Repo: https://github.com/NExB7R/EAH
- Production: https://eah-sq.vercel.app
- Vercel: iad1 (Washington D.C.)

---

## 15. أوامر مرجعية

```bash
# تحقق شامل
cd ~/EAH/web && npx tsc --noEmit && npx eslint . && npx prettier --check '**/*.{ts,tsx,css}'

# آخر 10 commit
cd ~/EAH && git log --oneline -10

# إيه اتغير في commit
cd ~/EAH && git show <hash>

# دور على pattern
cd ~/EAH/web && grep -rn 'Date.now()' app lib --include='*.tsx' --include='*.ts'
```

---

## ملاحظة نهائية

BRAIN.md حي. كل جلسة كبيرة -> حدّثه. كل خطأ جديد -> أضفه في القسم 8.

تحذير: لو لقيت نفسك بتقول مش عارف أعمل إيه — ارجع للأقسام 10, 11, 12. لو لسه مش عارف — اسأل المالك، ممنوع تخمّن.

---

## 16. Current State (2026-10-22)

**آخر commit:** `ce4e6537`
**الفرع:** `main` (clean)

### ✅ شغال

- **نظام الطلبات v2**: ETA إجباري + auto-deliver + feedback + reminder + admin control

- **تقارير الأنشطة** (`/admin/insights`): يدوي، اختيار نشاط + فترة + سيكشنات + طباعة + حذف

- Business wizard fullscreen + 10 contact types
- Notice + open-override + location picker (📍+OSM)
- Images: upload (file + URL) + delete (logo/cover/menu/gallery) — 200 على كل عمليات
- Offers CRUD (admin) + public offers tab
- Share modal (5 منصات + QR)
- Admin mobile drawer + profile + bell routing
- 3 layouts (admin/merchant/account) موحّدة: SecondaryHero + 1240px + footer
- كل التواريخ والأرقام Western (en-US)
- `/updates` اتشالت
- Security DB-04/05 + AP-05
- God Components ≤300 سطر

### ❌ مشاكل معروفة

- SEC-01: 11 مفتاح rotate
- SEC-02b: OIDC token في git history
- B2: 1 select('*') — admin-business (exception موثّق)

### 🎯 الأولويات

1. **أول نشاط حقيقي**
2. اختبار end-to-end
3. SEC-01 rotate
4. SEC-02b git history

### 🚫 ممنوع

- Puck/designtools/Surface
- Branches جديدة قبل الإطلاق
- DB بدون migration
- commit .env.local

**راجع `docs/NEXT_SESSION.md` للتفاصيل الكاملة.**
