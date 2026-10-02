# EAH — AUDIT_PLAN.md

> خطة Audit شاملة لمدة 7 أيام.

آخر تحديث: 2026-09-28

---

## 0. الهدف

فحص شامل لكل حاجة في EAH: الأمان، الأداء، الكود، قاعدة البيانات.
النتيجة: تقرير كامل + خطة إصلاح مرتبة.

---

## 1. القاعدة الصفرية

قبل أي إصلاح:
1. Backup كامل (Git + DB + .env).
2. تقرير بالأدلة — ممنوع التخمين.
3. الأولويات: CRITICAL ثم HIGH ثم MEDIUM ثم LOW.
4. اختبار بعد كل إصلاح.
5. commit منفصل لكل إصلاح.

---

## 2. اليوم 1: Backup شامل

- Git bundle: git bundle create ~/eah-backup-DATE.bundle --all
- .env backup: cp .env.local ~/eah-env-DATE.txt
- Supabase: Settings - Database - Backups (PITR)
- Tag: git tag -a v2.2.0-pre-audit -m "Before audit"

Checklist:
- [ ] Git bundle محفوظ
- [ ] .env backup محفوظ
- [ ] Supabase backup جاهز
- [ ] Tag v2.2.0-pre-audit

---

## 3. اليوم 2: Audit الأمان

- Supabase Advisors (Observability)
- RLS على كل جدول
- Policies موجودة لكل جدول
- مفيش secrets في Git
- Security Headers كاملة
- Rate Limiting
- Turnstile على signup

Checklist:
- [ ] كل الجداول RLS
- [ ] كل جدول عنده policies
- [ ] مفيش secrets في Git
- [ ] Security headers
- [ ] Rate limiting

---

## 4. اليوم 3: Audit الكود

- typecheck نظيف
- مفيش console.log
- مفيش any بدون تعليق
- مفيش TODO/FIXME معلق
- مفيش ملفات ميتة
- مفيش imports غير مستخدمة

Checklist:
- [ ] typecheck نظيف
- [ ] صفر console.log
- [ ] صفر any
- [ ] صفر TODO
- [ ] صفر ملفات ميتة

---

## 5. اليوم 4: Audit الأداء

- Vercel Analytics
- Lighthouse (كل صفحة)
- Core Web Vitals
- Bundle size
- صور Cloudinary
- Animations مستمرة

Checklist:
- [ ] Lighthouse 95+ Mobile
- [ ] Lighthouse 95+ Desktop
- [ ] FCP < 1.5s
- [ ] TTI < 3s
- [ ] CLS < 0.1
- [ ] Bundle < 200KB

---

## 6. اليوم 5: Audit قاعدة البيانات

- كل جدول UUID PK
- كل FK عنده index
- كل WHERE column عنده index
- RLS على الكل
- Service Role server only
- Audit logs شغالة

Checklist:
- [ ] UUID PK في كل جدول
- [ ] FK indexes
- [ ] WHERE indexes
- [ ] RLS 100%
- [ ] Audit logs

---

## 7. اليوم 6: Audit الاعتماديات

- npm audit
- npm outdated
- حجم الـ bundle
- مكتبات مش مستخدمة
- نسخ قديمة

Checklist:
- [ ] npm audit نظيف
- [ ] مفيش outdated خطير
- [ ] bundle size معقول

---

## 8. اليوم 7: التقرير النهائي

- جمع كل النتايج
- ترتيب المشاكل
- خطة الإصلاح
- Timeline

---

## 9. الأولويات

CRITICAL: ثغرات أمنية، بيانات مكشوفة، RLS معطل
HIGH: مشاكل أداء، أخطاء typecheck، أي مشكلة تمنع الإطلاق
MEDIUM: تحسينات، تنظيم، توثيق
LOW: تجميل، ملاحظات، أفكار مستقبلية

---

آخر تحديث: 2026-09-28
