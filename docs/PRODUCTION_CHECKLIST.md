
# EAH — PRODUCTION_CHECKLIST.md

> قائمة التحقق قبل الإطلاق. لازم كل بند يتحقق.
> آخر تحديث: 2026-09-27

---

## 1. الكود

- [ ] typecheck نظيف — npx tsc --noEmit
- [ ] صفر any بدون سبب
- [ ] صفر console.log
- [ ] صفر @ts-ignore بدون تعليق
- [ ] صفر TODO معلّق (إلا الموثّق)
- [ ] صفر imports غير مستخدمة
- [ ] صفر ملفات ميتة

---

## 2. الأداء

- [ ] Lighthouse 95+ (Mobile + Desktop)
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Bundle size < 200KB initial
- [ ] صفر animations مستمرة
- [ ] كل الصور next/image أو WmImage

---

## 3. الأمان

- [ ] RLS على كل جدول
- [ ] Service Role على server فقط
- [ ] صفر secrets في Git
- [ ] CSP صارم
- [ ] HTTPS إجباري
- [ ] HSTS مفعّل
- [ ] Rate limiting على /auth + /api
- [ ] Audit logs مفعّلة
- [ ] Zod validation على كل input
- [ ] صفر dangerouslySetInnerHTML

---

## 4. قاعدة البيانات

- [ ] كل جدول عليه RLS
- [ ] Indexes على الأعمدة المهمة
- [ ] Backups مفعّلة (Supabase)
- [ ] Migrations موثّقة
- [ ] صفر migrations معلّقة
- [ ] Functions مختبرة

---

## 5. الواجهة (UX)

- [ ] Mobile-first (320px+)
- [ ] Touch targets 44px+
- [ ] Contrast WCAG AA
- [ ] Keyboard navigation
- [ ] ARIA labels
- [ ] prefers-reduced-motion مدعوم
- [ ] Offline-first (PWA)
- [ ] Loading states
- [ ] Error states
- [ ] Empty states

---

## 6. المحتوى

- [ ] كل الصفحات موجودة (مش 404)
- [ ] كل النصوص عربي صحيح
- [ ] صفر typos
- [ ] كل الصور موجودة
- [ ] كل الروابط شغّالة (مفيش broken links)

---

## 7. التسجيل والمصادقة

- [ ] Signup شغّال
- [ ] Login شغّال
- [ ] Logout شغّال
- [ ] Recover شغّال
- [ ] Email verification (لو مفعّل)
- [ ] Session refresh شغّال
- [ ] Protected routes محمية

---

## 8. الاختبار

- [ ] Chrome (Desktop + Mobile)
- [ ] Firefox
- [ ] Safari (iOS)
- [ ] Edge
- [ ] iPhone SE (320px)
- [ ] iPhone 14 (393px)
- [ ] iPad (768px)
- [ ] Desktop (1440px)
- [ ] 4K (2560px)

---

## 9. SEO

- [ ] Metadata لكل صفحة
- [ ] Sitemap.xml
- [ ] Robots.txt
- [ ] OG images
- [ ] JSON-LD (LocalBusiness)
- [ ] Google Search Console
- [ ] Google Business Profile

---

## 10. النشر

- [ ] Vercel Pro (قبل الإطلاق)
- [ ] Domain مخصص (eah.app)
- [ ] SSL certificate
- [ ] Environment variables مضبوطة
- [ ] Cron jobs مضبوطة
- [ ] Monitoring (Sentry)
- [ ] Analytics (Vercel Analytics)

---

## 11. القاعدة الذهبية

- لو أي بند مش متحقق → **متطلقش**.
- لو في شك → **اسأل**.
- لو فيه خطر → **قف**.

---

## 12. الخلاصة

الهدف:
- منصة نظيفة.
- سريعة.
- آمنة.
- عربية أصيلة.
- تخدم أهل شبين القناطر.

---

آخر تحديث: 2026-09-27
