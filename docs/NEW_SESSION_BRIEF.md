# EAH — New Session Brief (نقطة البداية)

**آخر تحديث:** 2026-11-24
**هذا الملف = ما يقرأه أي AI في جلسة جديدة أولاً.**
**لا شيء قبل هذا الملف.**

---

## اقرأ بهذا الترتيب (15 دقيقة)

1. **هذا الملف** (10 دقائق)
2. `docs/QUALITY_GATES.md` (5 بوابات إلزامية)
3. `docs/SCREENSHOT_PROTOCOL.md` (screenshots = مصدر الحقيقة)
4. `docs/COMMON_AI_MISTAKES.md` (أخطاء حقيقية)
5. `docs/AI_LIMITATIONS.md` (نقاط ضعف AI)
6. `docs/RULES.md` (قواعد عامة)
7. `docs/WORKFLOW_CONSTRAINED.md` (Vercel paused)
8. `docs/DESIGN_REFERENCES.md` (مراجع تصميم)

**بعدها:** `git status` + `git log --oneline -10` + `npx tsc --noEmit`

---

## الحالة الحالية (2026-11-24)

| العنصر | الحالة |
|---|---|
| **Git** | `45863f4a` clean |
| **Vercel** | ⏸️ Paused حتى 2026-12-15 (Free CPU 4h) |
| **DB** | 13 باقة، 1 مستخدم (super_admin NourEldin)، 0 نشاط |
| **AI** | ✅ مفعّل (Groq + Upstash) — لكن "بحث ذكي" فقط، ليس مساعد شامل |
| **TS** | `npx tsc --noEmit` = 0 |
| **الجهاز** | 3.7GB RAM — لا parallel builds |

---

## الأدوار (مثبت — لا تغيير)

- **أدمن** (super_admin) — كود
- **تاجر** — كود + واجهة (**لا "بايع"**)
- **عميل** — كود + واجهة (**لا "مشتري"**)
- **زائر** — حالة وصول، ليس دور

**العميل أولاً استراتيجياً** (بدون عملاء = لا تجار = لا إعلانات).

---

## التموضع (مقفول — 2026-11-24)

**EAH = دليل اكتشاف محلي + تواصل + طلبات بسيطة.**
**ليس متجرًا إلكترونيًا.** راجع `docs/POSITIONING.md` قبل أي UI copy.

**ممنوع في UI:** "متجر"، "store"، "shop"، "سلة"، "cart"، "دفع إلكتروني"، "شحن".
**مسموح:** "نشاط"، "صفحة النشاط"، "تواصل"، "طلب"، "اكتشاف"، "عرض".

---

## القرارات الملتزم بها (لا تُناقش)

1. "تاجر" في كل مكان (لا بايع)
2. "عميل" في كل مكان (لا مشتري)
3. العميل أولاً استراتيجياً
4. Header / Footer / Hero = مقدسة (موافقة صريحة قبل لمس)
5. Dark only
6. Purple + Gold
7. Cairo + Tajawal
8. Micro-animations فقط (0.3s max, no 3D, no parallax)
9. Mobile-first (320px قبل 1920px)
10. لا Tailwind، لا مكتبات UI جديدة
11. لا force-dynamic بدون سبب (Vercel CPU)
12. `unoptimized: true` للصور (SIGILL fix + Cloudinary يحسّن)
13. **التموضع = دليل اكتشاف + تواصل + طلبات بسيطة — ليس متجرًا** (راجع `docs/POSITIONING.md`)

---

## الأسعار (مقفولة — من `docs/PRICING.md`)

| الباقة | شهري | 3 شهور | 6 شهور | 12 شهر | فروع |
|---|---|---|---|---|---|
| مجاني | 0 | — | — | — | 1 |
| مميز | 150 | 425 | 800 | 1,440 | 2 |
| احترافي | 300 | 850 | 1,600 | 2,880 | 4 |
| أعمال | 500 | 1,425 | 2,700 | 4,800 | 8 |

**عميل بريميوم:** 30/شهر (مؤجل — is_active=false).

---

## ما تم إنجازه (2026-11-18 → 2026-11-24)

### features
- ✅ Avatar uploader (crop + delete + drag-drop)
- ✅ ProfileHeader + ProfileTabs (profile/security/activity)
- ✅ Audit log (read + write + display)
- ✅ Phone search v6 (3 modes + privacy)
- ✅ Privacy Settings UI
- ✅ 2FA backend + UI
- ✅ Bio + verified_at
- ✅ online_orders كامل (لا واتساب كقناة طلبات)
- ✅ Offline Phase 1 (Service Worker caching)
- ✅ Offline Phase 2 (Flush API — idempotent)
- ✅ Sidebar مجموعات (collapsible)
- ✅ AI System (multi-provider: Groq→Gemini→OpenRouter + 7 tools + injection detection + rate limit)
- ✅ StatCard أرقام لاتينية
- ✅ TrustBar محذوف

### docs (15+)
HANDOFF, RULES, QUALITY_GATES, SCREENSHOT_PROTOCOL, COMMON_AI_MISTAKES, AI_LIMITATIONS, DESIGN_REFERENCES, AI_HANDOFF, WORKFLOW_CONSTRAINED, PYTHON_SAFE_PROTOCOL, OFFLINE_PLAN, PLATFORM_UPGRADE_PLAN, PRICING, PROFILE_SYSTEM, SEARCH_SYSTEM, PROJECT_MAP, SESSION_2026-11-15, SESSION_2026-11-18, DEV_WORKFLOW, MODERATION_PLAN

---

## ما لم يُختبر بصرياً (يحتاج screenshots)

- Home بعد حذف TrustBar
- Toggle online_orders (merchant + admin)
- AI chat (widget)
- offline Phase 2 end-to-end
- mobile (320px) لكل ما سبق

---

## المهام المتبقية (بالأولوية)

### P1 — فوري (اليوم)
1. **اختبار بصري** (screenshots) — 4 صفحات
2. **AI Enhancement — Knowledge Base** (`lib/ai/knowledge.ts`) — 30 دقيقة
   - الباقات، التسجيل، إضافة نشاط، لماذا EAH، vs alternatives
3. **Home rebuild** (4 أقسام مختصرة) — 4 ساعات
   - Hero (موجود) + "ليه EAH" + 3 worlds (أزرار) + Footer (موجود)

### P2 — قريباً (2-3 أيام)
4. **AI Tools الجديدة** — get_plans، get_registration_guide، get_why_eah
5. **AI Prompt Rewrite** — النبرة الدافئة + "نفسك في EAH؟"
6. **Moderation System** — scan.ts + penalty.ts + Admin panel (3-4 أيام، `docs/MODERATION_PLAN.md`)

### P3 — قبل الإطلاق (15 ديسمبر+)
7. **إدخال 50 نشاط حقيقي**
8. **Vercel Pro** ($20/شهر)
9. **eah.store** (دومين)
10. **اختبار حقيقي على موبايل**

---

## القواعد الذهبية (13)

1. اقرأ قبل تكتب (cat + grep)
2. `tsc = 0` بعد كل patch
3. ملف واحد → patch → tsc → التالي
4. **Python heredoc** لإنشاء ملفات (لا `cat << EOF` مع عربي)
5. **Screenshot** = مصدر الحقيقة (لا "يعمل" بدون)
6. لا regex شامل على ملفات متعددة
7. لا commit قبل 5 Quality Gates
8. لا force push
9. **Add-Then-Remove** (لا Remove-Then-Add)
10. Python-safe: أي ملف > 10 أسطر أو فيه عربي → Python script
11. commit message: `feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert|sec`
12. لا `npm run build` محلياً (SIGILL)
13. إذا شككت → اسأل قبل التنفيذ

---

## الملفات الحرجة (لا تعدّل بدون موافقة)

- `app/layout.tsx`, `app/page.tsx`, `proxy.ts`
- `lib/supabase/*` (server, service, public)
- `next.config.ts`

---

## كيف تتعامل معي (AI جديد)

**أنت (AI) ستقول:**

> "قرأت NEW_SESSION_BRIEF + QUALITY_GATES + SCREENSHOT_PROTOCOL.
> الحالة: 45863f4a clean، Vercel paused، DB 0 نشاط.
> المهمة التالية: [من P1].
> سأبدأ بـ [خطوة محددة]."

**لا تخمين. لا كود قبل قراءة الملفات. لا "تم" بدون screenshot.**

---

## كلمة أخيرة

المشروع بني في 3 أسابيع. **22 جدول DB، 60+ صفحة، AI system، offline، trust system، moderation plan**.

**باقي 60-70% للإطلاق:** إدخال أنشطة حقيقية، AI enhancement، Home rebuild، Vercel Pro.

**لا تستعجل. لا تحرق نفسك. الجودة > السرعة.**
