# AI Handoff — Session 2026-11-19

## اقرأ قبل أي شيء (بالترتيب):
1. HANDOFF.md — حالة عامة
2. QUALITY_GATES.md — 5 بوابات
3. SCREENSHOT_PROTOCOL.md — screenshots = مصدر الحقيقة
4. COMMON_AI_MISTAKES.md — أخطاء حقيقية
5. AI_LIMITATIONS.md — نقاط ضعف AI + حلول
6. DESIGN_REFERENCES.md — مراجع تصميم
7. هذا الملف

## الحالة الحالية
- Git: clean (آخر commit = 8e3c2d7)
- 25+ commit ليلة 2026-11-18/19
- Vercel: paused حتى 2026-12-15
- DB: 13 باقة + 1 مستخدم (NourEldin) + 0 نشاط
- AI: مفعّل (GROQ + Upstash Redis)

## ما تم إنجازه
- online_orders كامل (8 commits)
- offline Phase 1 + Flush API (2 commits)
- TrustBar محذوف
- CSP + SIGILL fixes
- AI keys (GROQ + Upstash) مضبوطة

## ما لم يُختبر بصريًا
- Home بعد حذف TrustBar
- Toggle online_orders
- AI chat
- offline Phase 2 end-to-end

## القرارات الملتزم بها
- "تاجر" في كل مكان (لا "بايع")
- "عميل" (لا "مشتري")
- العميل أولًا (استراتيجيًا)
- Header/Footer/Hero مقدسة (موافقة قبل لمس)

## خطة الجلسة القادمة
1. اختبار بصري (screenshots 4 صفحات)
2. تحسين AI Assistant (راجع AI_ENHANCEMENT.md)
3. Home rebuild (4 أقسام مختصرة)
4. إدخال 3 أنشطة حقيقية
