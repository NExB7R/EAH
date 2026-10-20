# EAH — AI_PLAYBOOK.md

> **نقطة البداية الوحيدة لأي شات AI على EAH.**
> آخر تحديث: 2026-10-20

---

## 0. ترتيب القراءة (15 دقيقة)

1. **هذا الملف**
2. `docs/BRAIN.md` — ملخص سريع
3. `docs/ERROR_REGISTER.md` — الأخطاء المعروفة
4. `docs/SACRED.md` — الهوية (ممنوع بدون إذن)
5. `docs/ROLES_MATRIX.md`
6. `docs/CONTEXT_MAP.md`
7. `docs/LESSONS.md`

بعدها قول: **"قرأت. جاهز."** واستنى.

---

## 1. بداية كل جلسة (3 دقائق)

```bash
git pull --ff-only
git log --oneline -10
cd web && npx tsc --noEmit && npx eslint . 2>&1 | head -10
```

في Supabase SQL Editor (قراءة فقط):
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
```

**ليه؟** الـ DB بتتغير من SQL Editor، والوثائق بتتأخر.

---

## 2. بروتوكول أي تعديل (7 خطوات)

1. **افهم:** اقرا الملف + `grep -rn "الاسم" web/ docs/`
2. **خريطة الأثر:** مين بيتأثر؟ (ملفات، DB، RLS، GRANT، أدوار، وثائق، اختبارات)
3. **استأذن** لو في `SACRED.md §4`
4. **عدّل أقل ما يمكن.** ممنوع تحسينات جانبية
5. **راجع نفسك** بقائمة §6
6. **افحص فعلياً** (§3)
7. **وثّق:** ERROR_REGISTER + PROGRESS + SESSION_LOG + CHANGELOG

---

## 3. تعريف "تم" (DoD)

| الفحص | الأمر | أين |
|---|---|---|
| الأنواع | `npx tsc --noEmit` | محلي |
| الكود | `npx eslint <الملفات>` | محلي |
| التنسيق | `npx prettier --check <الملفات>` | محلي |
| الاختبارات | `npx vitest run <الملف>` | محلي |

**لو ما قدرتش تشغل حاجة:** قول صراحة. ممنوع تفترض النجاح.

---

## 4. قواعد الكود

**كل Server Action / API route:**
```
هوية → دور → Zod → rate limit → فحص الملكية → تنفيذ → logAudit → revalidatePath → رسالة عربية
```

**service client:** فقط على السيرفر بعد فحص الهوية + سبب في تعليق.

**cron:** `verifyCron(req)` من `lib/auth/cron.ts` — fail-closed.

**rate limit:** الحساس fail-closed.

**ملكية النشاط:** ممنوع `.eq('owner_profile_id', id).maybeSingle()`.

**الأدوار:** من الـ DB، مش من user_metadata.

**ممنوع:** `console.log`, `any`, `@ts-ignore` بدون سبب, `select('*')` جديد, `<img>` خام, ألوان محظورة, `animation: infinite`, `backdrop-filter` على كروت, إيموجي في UI.

---

## 5. بروتوكول قاعدة البيانات

أي تغيير = **ملف migration** في `docs/migrations/YYYY-MM-DD-اسم.sql`.

**جدول جديد = 6 أشياء:**
1. ENABLE ROW LEVEL SECURITY
2. سياسات (`(select auth.uid())` + `TO authenticated`)
3. **GRANT صريح للأدوار** (سبب DB-01)
4. index على كل FK
5. اختبار RLS
6. تحديث CONTEXT_MAP

**دالة جديدة:** `SECURITY DEFINER` فقط لو لازم + `SET search_path = public` + فحص هوية + REVOKE/GRANT صريح.

**قبل migration على الإنتاج:** Backup + خطة رجوع مكتوبة.

---

## 6. المراجعة الذاتية (12 سؤال)

1. عدّلت أكتر من المطلوب؟
2. عملت `grep` على كل من يستدعي اللي غيّرته؟
3. مين الدور اللي يقدر ينفذ ده؟ جرّبت بالدور؟
4. فين فحص الهوية + الملكية؟
5. فين rate limit؟ fail-open أم fail-closed؟
6. لو خدمة خارجية وقعت، إيه بيحصل؟
7. فيه بيانات شخصية بتتسرب؟
8. GRANT/REVOKE صح؟
9. شغّال على 320px و RTL؟
10. بيخالف SACRED؟
11. الوثائق + ERROR_REGISTER اتحدّثوا؟
12. اختبار بيمسك الخطأ ده لو رجع؟

---

## 7. الإصلاح الذاتي

```
verify → اقرا الفشل → سبب جذري → صلّح → أعد verify
```

**ممنوع:** --no-verify, رفع baseline, تعليق اختبار, eslint-disable لإسكات.

**لو فشل 3 مرات:** اوقف، قدم الأدلة، اسأل المالك.

**لو لقيت خطأ جديد:** سجّله في ERROR_REGISTER بـ ID.

---

## 8. الترقية والتحديث 2027

- تحديث واحد في المرة، على branch، Preview + CI أخضر
- `npm outdated` → اختار اعتمادية → release notes → تحديث → tsc/eslint/vitest → push → اختبار دخان على Preview → merge
- ممنوع: أكتر من major في commit، لمس package-lock يدوياً

**الترتيب:** إصلاحات ERROR_REGISTER ← Node/Next/React ← Supabase ← TS ← CAPTCHA + migrations ← أداء ← Sentry ← E2E ← OTP + خصوصية

---

## 9. ممنوعات مطلقة

secrets في Git/الشات · service_role في client · تعطيل RLS · GRANT بالجملة · DROP/TRUNCATE/تعديل migration مطبّقة · force push · --no-verify · deploy بدون موافقة · تعديل SACRED §4 · تغيير الهوية · قراءة `.env*`.

**اسأل المالك لما:** القرار منتج/قانوني · خطر على بيانات حقيقية · فشل نفس الفحص 3 مرات.

---

## 10. تقرير نهاية الجلسة (6 أسطر)

```
تغيّر:        <إيه وليه>
الملفات:      <القائمة>
اتفحص فعلًا:  <الأمر + النتيجة>
ما لم يُتحقق: <بصراحة>
ERROR_REGISTER: <IDs اتصلحت/اتسجلت>
المخاطر:      <الباقي>
```

---

## 11. Invariants verifier (pending)

`scripts/verify-invariants.mjs` **لم يُكتب بعد.** يغطي B1-B9 من ERROR_REGISTER §6.

---

## 12. أوامر جاهزة

```bash
git log --oneline -10
grep -rn "اسم_الدالة" web/app web/lib web/components
gitleaks detect --log-opts="--all"
```