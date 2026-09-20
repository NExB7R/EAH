# EAH — حالة المشروع

آخر تحديث: 2026-09-20
النسخة: v1.1.2
Branch: ui-onlook

## المشروع
EAH — منصة اكتشاف محلية (شبين القناطر + القرى)
- Production: https://eah-sq.vercel.app
- GitHub: NExB7R/EAH
- Vercel: eah-74a0/eah (Hobby)
- Supabase: npmpiivmdksdirrumbmt
- Cloudinary: zlgcimmg

## المالك
NourEldin B7R — مصري، من شبين القناطر
- طريقة العمل: حاجة حاجة — بدون قوايم
- النبرة: مصري شعبي، أخوي، مباشر
- السلوغان: "اللي نفسك فيه ؟"

## القواعد المقدسة
1. حاجة حاجة — مفيش قوايم مننا
2. Deploy في حدود — مش بعد كل تعديل
3. مفيش بناء على رمال — افحص الأول
4. TSC قبل commit: npx tsc --noEmit
5. set +H قبل أي أمر فيه !
6. مفيش build محلي — Vercel يبني
7. Deploy: ./deploy.sh (مش انتظار webhook)
8. لو اتكسرت، رجّعها فوراً

## اللي خلص
### الفيتشرات
- Follow + كوبونات + ولاء Bronze/Silver/Gold
- Voice Search مصري + Smart Arabic search
- Near Me + QR Code لكل نشاط
- Customer locations + Order location picker
- Watermark Cloudinary + Promo campaign
- Collect tool 2026 (فيسبوك/إنستجرام/جوجل مابس)

### الأمان
- Rate limiting + 2FA + Turnstile
- CSP كامل + Service Role + VAPID rotated

### UI/UX
- UI Library كامل (20 مكون)
- تدرّج h1/h2/h3 تلقائي
- توحيد كل الصفحات
- Toast + Skeleton + Admin sidebar قابل للطي

### التوثيق
LICENSE + COPYRIGHT + OWNER + docs/OWNERSHIP_EGYPT
docs/SECURITY_AUDIT + SECURITY_HARDENING
docs/DESIGN_IDEAS_2026 + GROWTH_IDEAS
docs/LAUNCH_CHECKLIST + DEPLOY_SETUP
docs/WORKFLOW + ISSUES_2026_09_19

## اللي فاضل
### تدقيق شامل (الآن)
- مرحلة A — تدقيق 60 صفحة (يومين)
- مرحلة B — الأولويات مع Nour
- مرحلة C — تنفيذ حاجة حاجة
- القاعدة: مفيش كود يتعدل لحد ما التدقيق يخلص

### بعد التدقيق
- قرار: استوديو drag-drop كامل؟ (~6 أسابيع)
- Business Form rewrite (URLs + 4 أقسام صور + أوقات اختيارية)
- Business page (seekh) — إصلاح العرض
- Add 8 real businesses
- Full mobile test

### قبل الإطلاق
- Vercel Pro upgrade ($20/شهر)
- Domain (eah.com / eah-eg.com)
- صفحة فيسبوك رسمية
- تحديث روابط فيسبوك
- Promo campaign test

## اقرأ بالترتيب
1. PROJECT_STATE.md (هذا)
2. docs/WORKFLOW.md
3. docs/audit/README.md
4. HANDOFF_TO_NEXT_CHAT.md
5. AGENTS.md
6. PROJECT_MEMORY.md

## الأوامر السريعة
cd ~/EAH && ./deploy.sh "msg"
cd ~/EAH/08-web && npx tsc --noEmit
cd ~/EAH/08-web && vercel login
Supabase: https://supabase.com/dashboard/project/npmpiivmdksdirrumbmt/sql/new

## تحذيرات
- Vercel Hobby = 100 deploy/يوم + ممنوع تجاري
- Service Role Key — لا تنشره
- .env.local — لا يدخل GitHub
- قبل migration — افحص Supabase الأول

## اللي عندنا في الجهاز
- 00-project-status.md (قديم — مرجع)
- PROJECT_STATE.md (هذا — الحالة الحالية)
- docs/WORKFLOW.md (طريقة العمل)
- docs/audit/README.md (خطة التدقيق)
