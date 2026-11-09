# EAH — Launch Day Runbook 🚀

> دليل تنفيذي ليوم الإطلاق.

## ⏰ T-7 (أسبوع قبل)

- [ ] تنفيذ cleanup.sql
- [ ] إضافة 3+ أنشطة حقيقية
- [ ] إضافة 1+ عرض حقيقي
- [ ] Launch Readiness ≥ 90%
- [ ] Verify Launch 16/16

## ⏰ T-3 (يومين قبل)

### Secrets Rotation
- [ ] Rotate VERCEL_OIDC_TOKEN
- [ ] Rotate Supabase Service Role
- [ ] Rotate Cloudinary API Secret
- [ ] Update Vercel env vars

### Domain
- [ ] شراء الدومين
- [ ] ربطه في Vercel
- [ ] تحديث DNS
- [ ] NEXT_PUBLIC_SITE_URL

### Email
- [ ] بريد رسمي
- [ ] تفعيله في /admin/settings

## ⏰ T-1 (يوم قبل)

### Pre-Flight
- [ ] كل الصفحات تعمل
- [ ] A11y: redirect + anon denied
- [ ] Lighthouse: ≥85 Performance
- [ ] LCP <2.5s, CLS <0.1

### Content
- [ ] مراجعة النصوص
- [ ] /about /terms /privacy /faq
- [ ] صور مضغوطة

### Social
- [ ] Facebook page
- [ ] WhatsApp channel
- [ ] 3-5 منشورات إطلاق

## ⏰ T-0 (يوم الإطلاق)

### صباح (8-10)
- [ ] Verify Launch 16/16
- [ ] Launch Readiness ≥90%
- [ ] Vercel READY

### قبل الظهر (10-12)
- [ ] تفعيل الدومين
- [ ] اختبار 3 أجهزة
- [ ] Search Console

### GO LIVE (12-14)
- [ ] Facebook Post 1
- [ ] WhatsApp channel
- [ ] رسائل أول 10 تجار

### Monitor (14-22)
- [ ] كل ساعة: health + errors + analytics

### ليل
- [ ] Backup يدوي
- [ ] SESSION_LOG

## ⏰ T+1 + T+7

- [ ] مراجعة errors
- [ ] Post 3, 4, 5
- [ ] 10 interviews
- [ ] تحديث PROGRESS

## 🚨 Emergency Rollback

### جزئي
- Vercel: maintenance redirect
- serverActions = false
- Facebook: صيانة

### كامل
- git revert HEAD~N..HEAD --no-edit
- git push origin main

## 📊 Success Metrics

### 24h
| المقياس | الهدف |
|---|---|
| زوار | 50+ |
| تسجيلات | 10+ |
| طلبات | 1+ |

### أسبوع
| المقياس | الهدف |
|---|---|
| زوار | 300+ |
| تسجيلات | 50+ |
| تجار | 5+ |

### شهر
| المقياس | الهدف |
|---|---|
| زوار | 2000+ |
| تسجيلات | 200+ |
| تجار | 15+ |

## ✅ Final (before GO)

- [ ] Verify 16/16
- [ ] Readiness ≥90%
- [ ] Secrets rotated
- [ ] Domain شغال
- [ ] 3+ أنشطة
- [ ] 2+ تاجر
- [ ] Post 1 جاهز
- [ ] Vercel READY

**→ GO 🚀**
