# Common AI Mistakes — Anti-Patterns

**اقرأ هذا قبل أي patch.** كل خطأ هنا حصل فعليًا في هذا المشروع.

---

## 1. regex شامل على ملفات متعددة

خطأ: loop على 12 ملف + regex واحد لحذف حقل.
النتيجة: 54 خطأ TS في 5 ملفات، commit فشل.

الصحيح: ملف واحد → patch محدد → tsc → تحقق → التالي.
لا regex شامل. استخدم replace مع نص مطابق تمامًا.

---

## 2. EXIT=0 مضلل في tsc

خطأ: npx tsc --noEmit | head -20; echo "EXIT=$?"
هذا يعكس exit code head (دائمًا 0) وليس tsc.

الصحيح:
npx tsc --noEmit > /tmp/tsc.log 2>&1; echo "REAL_EXIT=$?"; tail -5 /tmp/tsc.log

استخدم REAL_EXIT دائمًا.

---

## 3. JSON placeholder في SQL

خطأ: values ('[...]'::jsonb)
النتيجة: Token "." is invalid.

الصحيح: values ('["featured_badge","verified_badge"]'::jsonb)

---

## 4. حذف عمود قبل تحديث الكود

خطأ: migration يحذف العمود، ثم patch الكود.
النتيجة: بين الاثنين، الكود يشير لعمود مفقود → 54 خطأ.

الصحيح: ADD new column → update code → keep legacy → deploy + test → THEN drop.

Add-Then-Remove، لا Remove-Then-Add.

---

## 5. AI يقول "تم" دون تحقق

خطأ: "✓ Migration applied" (لكن لم تنفذ في SQL Editor).
الصحيح: نفذ → SELECT تحقق → أرسل النتائج → ثم "تم".

لا "تم" بدون إثبات (SQL output, tsc log, screenshot).

---

## 6. commits متعددة في رد واحد

خطأ: Commit A + B + C + D في رسالة واحدة.
النتيجة: لو C فشل، A+B مدفوعان، C+D فاشلان → حالة هجينة.

الصحيح: commit واحد → push → إرسال → التالي.

---

## 7. JSONB mutation دون تحقق

خطأ: update...where features @> whatsapp_orders — لم ينفذ لأن الحقل غير موجود.

الصحيح: SELECT قبل → UPDATE مباشر بـ 9 features → SELECT بعد (jsonb_array_length).

---

## 8. القفز فوق UI بعد DB

خطأ: "DB complete, moving to Home" — لكن UI لم يعدل.

الصحيح: DB → Commit → UI → Commit → Test → ثم انتقل.

Feature = DB + UI + Test.

---

## 9. تجاهل Vercel pause

خطأ: "Deploy to production" — Vercel paused حتى 15 ديسمبر.

الصحيح: Development local. Commits to GitHub. Auto-deploy when Vercel resumes.

---

## 10. عدم التحقق قبل migration

قبل كل DROP COLUMN: SELECT count للبيانات. إذا > 0، تحديث أولًا.

---

## Checklist قبل patch

- اقرأ الملف كاملًا (cat)
- grep للاستخدامات
- ملف واحد
- replace محدد (لا regex)
- tsc: REAL_EXIT=0
- prettier
- commit + push
- أرسل للمستخدم

## Checklist قبل migration

- ملف في docs/migrations/YYYY-MM-DD-name.sql
- SELECT قبل
- IF NOT EXISTS / IF EXISTS
- تطبيق في SQL Editor
- SELECT بعد
- أرسل النتائج

## Checklist قبل commit

- tsc = REAL_EXIT=0
- prettier نظيف
- eslint نظيف
- vitest (لو منطق تغير)
- لا server-only imports في client
- git pull --rebase قبل push
