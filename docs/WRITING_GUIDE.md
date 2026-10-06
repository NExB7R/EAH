# EAH — WRITING_GUIDE.md

> دليل كتابة الملفات + تشغيل الأوامر بدون أخطاء
> آخر تحديث: 2026-10-07

---

## 1. القاعدة الذهبية

- ممنوع nano
- ممنوع heredoc طويل
- استخدم Python دايماً

---

## 2. الكتابة للملفات

### 2.1 ملف أقل من 5 سطر
استخدم echo مباشر.

### 2.2 ملف 5-20 سطر
استخدم cat مع EOF — بدون رموز مشكلة.

### 2.3 ملف أكبر من 20 سطر — Python إجباري

### 2.3 ملف أكبر من 20 سطر — Python إجباري

- اكتب المحتوى في Python string
- استخدم open().write()
- تحقق بـ wc -l

### 2.4 ملف أكبر من 100 سطر — chunks

- قسّم لأجزاء 50-80 سطر
- جزء 1: open().write()
- الباقي: open().write() مع 'a' للنموذج

---

## 3. الرموز اللي بتكسر heredoc

ممنوع في heredoc:
- backticks
- dollar-parentheses
- dollar-brackets
- علامة التعجب في أول السطر
- علامات أصغر وأكبر في بعض الحالات

الحل: استخدم Python — يقبل أي رمز.

---

## 4. الأوامر الكبيرة

### 4.1 SQL في Supabase

مفيش chunking — الصق كامل مرة واحدة.

لو فشل:
1. خد الملف في Python script واحد
2. اكتبه في ملف واحد
3. الصق الملف في Supabase

### 4.2 Terminal Commands

ممنوع:
- أمر فيه 10+ lines
- heredoc أكبر من 50 سطر
- paste فيه emojis

استخدم:
- أمر واحد بس في المرة
- بعد كل أمر → تحقق

### 4.3 Python Scripts

مسموح — بيشتغل حتى لو 500 سطر.

---

## 5. التحقق بعد كل كتابة

إلزامي:
- wc -l
- head -3
- tail -3

---

## 6. الأخطاء الشائعة

### 6.1 command not found

السبب: النص كان فيه backticks واتفهم كـ command.

الحل: استخدم Python.

### 6.2 syntax error near unexpected token

السبب: رموز مش مسموحة في heredoc.

الحل: استخدم Python.

### 6.3 Terminal بيفصل النص

السبب: paste طويل — 100+ سطر.

الحل: قسّم chunks.

### 6.4 الملف اتحفظ فاضي

السبب: heredoc اتقطع.

الحل: تحقق بـ wc -l فوراً.

---

## 7. الطريقة الرسمية للـ AI

عشان الشات الجديد:

1. ملف أكبر من 20 سطر → Python
2. بعد كل كتابة → wc -l + head + tail
3. لو Terminal بيفشل → نسخة Python
4. لو SQL → paste مرة واحدة
5. لو فشل → اسأل المالك

---

## 8. المراجع

- AI_CONTRACT.md §36 — قاعدة Python
- LESSONS.md §2.1 — heredoc fail
- LESSONS.md §25 — قاعدة Python
