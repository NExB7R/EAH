# EAH — ابدأ من هنا 👋

> لو إنت **إنسان** أو **AI** — اقرا الملف ده الأول. 5 دقايق.

## 🎯 إيه EAH؟

منصة اكتشاف محلية لشبين القناطر والقرى حواليها.
- السلوغان: **اللي نفسك فيه ؟**
- الهدف: نوصل كل نشاط محلي بالعميل بتاعه مباشرة
- Production: https://eah-sq.vercel.app

## 👤 مين Nour؟

- الاسم: NourEldin B7R
- من شبين القناطر، مصر
- **طريقة العمل: حاجة حاجة — بدون قوايم**
- **deploy بأمر صريح منه فقط**
- **مفيش حذف بدون موافقته**

## 📚 الملفات — اقرأها بالترتيب

1. **START_HERE.md** (ده) — نظرة عامة
2. **docs/LIVE_STATE.md** — الحالة الحالية
3. **SECRETS.md** — الأسرار (بدون قيم)
4. **AGENTS.md** — قواعد صارمة
5. **PROJECT_MEMORY.md** — دروس عبر الجلسات
6. **docs/WORKFLOW.md** — طريقة العمل مع Nour
7. **HANDOFF_TO_NEXT_CHAT.md** — آخر جلسة

## 🏗️ التقنيات

| الطبقة | التقنية |
|---|---|
| Framework | Next.js 16 + React 19 + TypeScript |
| DB | Supabase (Postgres + RLS + Auth) |
| Hosting | Vercel (Hobby) |
| Images | Cloudinary |
| Push | Web Push + VAPID |

## 🚀 الأوامر الأساسية

```bash
cd ~/EAH && ./deploy.sh "msg"     # typecheck + commit + push + deploy
cd ~/EAH/08-web && npx tsc --noEmit  # typecheck بس
cd ~/EAH && ./sync-docs.sh        # تحديث الملف الحيّ
cd ~/EAH && ./clean.sh            # فحص ملفات يتيمة
cd ~/EAH && ./lock.sh             # تشفير secrets
cd ~/EAH && ./unlock.sh           # فك التشفير
