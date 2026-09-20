# EAH — دليل الأسرار (بدون قيم)

> ⚠️ الملف ده مفيهوش أي قيم. القيم في .env.local + Vercel + Supabase.

## 🗄️ Supabase

| السر | الاستخدام | المصدر |
|---|---|---|
| NEXT_PUBLIC_SUPABASE_URL | URL المشروع | Supabase → Settings → API |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | Client key | Supabase → Settings → API → anon |
| SUPABASE_SERVICE_ROLE_KEY | Server-only، بتخطى RLS | Supabase → Settings → API → service_role |
| CRON_SECRET | حماية cron endpoints | تولّد عشوائي |

## 🔔 Push Notifications

| السر | الاستخدام | المصدر |
|---|---|---|
| VAPID_PUBLIC_KEY | Web Push public | npx web-push generate-vapid-keys |
| VAPID_PRIVATE_KEY | Web Push private | نفس الأمر |
| NEXT_PUBLIC_VAPID_PUBLIC_KEY | Client public | نفس القيمة الأولى |
| VAPID_SUBJECT | mailto للpush | إيميل المالك |

## 📸 Cloudinary

| السر | الاستخدام | المصدر |
|---|---|---|
| CLOUDINARY_CLOUD_NAME | اسم الحساب | Cloudinary Dashboard |
| CLOUDINARY_API_KEY | API key | Cloudinary → Settings → Access Keys |
| CLOUDINARY_API_SECRET | API secret | نفس المكان |

## 📊 Sentry

| السر | الاستخدام | المصدر |
|---|---|---|
| SENTRY_DSN | تتبع الأخطاء | Sentry → Project Settings |
| NEXT_PUBLIC_SENTRY_DSN | Client side | نفس القيمة |

## 🚀 Vercel

| السر | الاستخدام | المصدر |
|---|---|---|
| VERCEL_TOKEN | CLI deploy | Vercel → Account → Tokens |

---

## 🔑 إزاي تجيب كل سر

### Supabase
1. https://supabase.com/dashboard/project/npmpiivmdksdirrumbmt/settings/api
2. Project URL → NEXT_PUBLIC_SUPABASE_URL
3. anon public → NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
4. service_role → SUPABASE_SERVICE_ROLE_KEY (خطير)

### VAPID
npx web-push generate-vapid-keys

### Cloudinary
https://cloudinary.com/console → Dashboard

### Vercel Token
https://vercel.com/account/tokens

---

## 💾 Backup مشفّر

على الجهاز:
  cd ~/EAH && ./lock.sh

الاسترجاع:
  ./unlock.sh
  rm -rf /tmp/eah-restored    # امسح بعد الاستخدام

passphrase:
- في password manager (Bitwarden / 1Password)
- أو ورقة في مكان آمن
- مش في أي ملف

## 🔄 استرجاع القيم

من Vercel:
  cd ~/EAH/08-web
  vercel env pull .env.production.local

## ✅ قواعد أمنية

1. مفيش قيمة في Git أبداً
2. مفيش قيمة في Chat/Screenshot
3. .env.local بصلاحيات chmod 600
4. rotate service_role + VAPID كل 3 شهور
5. نسخ مشفّرة على مكانين على الأقل

