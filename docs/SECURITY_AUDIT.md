# EAH — Security Audit Report
التاريخ: 2026-09-19
المراجع: تلقائي

## ✅ إجراءات موجودة
- CSP (Content Security Policy) كاملة في next.config.ts
- HSTS + X-Frame-Options + X-Content-Type-Options
- RLS مفعّل على كل جداول Supabase
- pre-commit hook يمنع تسريب secrets
- Service Role Key محمي (Vercel env only)
- VAPID keys محدّثة
- Rate limiting (memory + DB)
- Password hashing (Supabase Auth default)

## 🔴 حرج — يحتاج فعل فوري
| # | البند | الإجراء | الأولوية |
|---|-------|---------|----------|
| 1 | Rotate Service Role Key (قديم اتكشف) | Supabase → Settings → API → Rotate | عاجل |
| 2 | Rotate VAPID Keys على Vercel | vercel env rm ثم add | عاجل |
| 3 | Deploy Hook URL مكشوف | Revoke من Vercel Dashboard | عاجل |
| 4 | تفعيل 2FA للأدمن | Supabase MFA + صفحة تفعيل | مهم |
| 5 | Turnstile على register/apply | Cloudflare Turnstile مجاني | مهم |

## 🟡 متوسط
- Rate limiting في الذاكرة فقط (ينقص Redis Upstash)
- لا يوجد WAF (Cloudflare WAF مجاني متاح)
- Sentry alerts غير مفعّلة على الأخطاء الحرجة
- Supabase leaked-password protection لسه مش مفعّل

## 🟢 اقتراحات
- CSP reporting endpoint
- IP allowlist للأدمن
- Session revocation عند تغيير كلمة السر
- Audit log لكل admin action (موجود جزئياً)

## القياسات
- Lighthouse Security Score: يُقاس بعد آخر deploy
- SSL Labs Grade: A+ (HSTS + TLS 1.3)
- Mozilla Observatory: B (يحتاج CSP refinements)
