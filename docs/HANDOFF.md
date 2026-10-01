# EAH — HANDOFF (نقل لشات جديد)

> اقرأ ده الأول. آخر تحديث: 2026-10-01

**آخر commit:** fd02abf
**الإصدار:** v2.4.0-alpha
**SSH:** مفعّل على port 443 (لأن 22 محجوب)

---

## ابدأ من هنا

1. AI_CONTRACT.md — القواعد (خاصة §26-§31)
2. PROGRESS.md — حالة الملفات
3. SESSION_LOG.md — آخر جلسة
4. SECURITY_PLAN.md — خطة الحماية
5. AI_LESSONS.md — أخطاء AI الشائعة
6. QUALITY.md — نظام الجودة

بعدها: "قرأت. جاهز." واستنى.

---

## القواعد الذهبية للمستخدم

### §29 — شرح للمالك
لو المستخدم طلب شرح -> شرح بالعامية المصرية، جمل قصيرة.

### §31 — تواصل مختصر
مفيش شرح إلا لو المستخدم طلب.
- مفيش مقدمات ("تمام، هنعمل...")
- مفيش خلاصات طويلة
- الأوامر مباشرة -> نتائج بس

### ممنوع
- سؤال "إنت فين؟" أو "الساعة كام؟"
- تعليق على وقت العمل
- نصايح عن الراحة

---

## اللي خلص

### الأمان (11 طبقة)
- Column-level REVOKE على profiles
- 4 RPC functions
- 4 DB Triggers
- Turnstile على التسجيل
- Supabase Auth Rate Limits
- Upstash Rate Limiting
- CSRF allowedOrigins
- Anonymous sign-ins مقفولة
- Next.js 16.3.8
- Security Headers
- gitleaks

### الجودة
- ESLint: 0 issues
- 58 Vitest tests
- GitHub Actions (quality + RLS)
- lefthook (3-stage)
- knip + jscpd
- Dependabot

### Features
- Impact Card في /account
- Follow/Favorite live
- Review -> activity
- البحث بالرقم /find

### DB Migrations (4)
1. trust-foundation (profiles + activities + reviews + moderation)
2. security-hardening (4 triggers)
3. impact-computation (compute_user_impact + trigger)
4. find-by-phone (RPC)

---

## اللي ناقص

### حرج
- AI Agent (Recourse setup)
- Web Push (VAPID + SW)
- إشعارات in-app
- اختبار المنصة (2 نشاط من كل نوع)
- الصفحات المتبقية

### متوسط
- RLS Tests (لما Supabase يرجع)
- E2E Tests (Playwright)
- Strict CSP (nonce-based)

### مؤجل
- OTP SMS / WhatsApp (مدفوع)
- Supabase Pro (25$/شهر)
- Vercel Pro (20$/شهر)
- Sentry (بديله Vercel Analytics)

---

## مشاكل معروفة

1. SIGILL في build محلي — جهاز المستخدم. الحل: Vercel Preview.
2. SSH port 22 محجوب في مصر. الحل: SSH over 443.
3. Supabase Free plan — بيقف عند الخمول.
4. GitHub push بطيء من مصر (shaping). الحل: صبر أو SSH.

---

## أوامر مهمة

typecheck:
cd ~/EAH-V2/web && npx tsc --noEmit

اختبارات:
cd ~/EAH-V2/web && npx vitest run

commit (lefthook هيشتغل آلي):
cd ~/EAH-V2 && git add -A && git commit -m "..."

push (SSH over 443):
cd ~/EAH-V2 && git push origin main:v2

---

## قائمة الملفات (16)

1. AI_CONTRACT.md
2. MASTER_BRIEF.md
3. SACRED.md
4. LESSONS.md
5. STRUCTURE.md
6. SECURITY.md
7. CODE_STANDARDS.md
8. DEBUGGING.md
9. PRODUCTION_CHECKLIST.md
10. DATABASE_RULES.md
11. AI_HANDOFF.md
12. PROGRESS.md
13. TODO.md
14. SESSION_LOG.md
15. SECURITY_PLAN.md
16. AI_LESSONS.md

---

آخر تحديث: 2026-10-01
