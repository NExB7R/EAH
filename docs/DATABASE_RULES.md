
# EAH — DATABASE_RULES.md

> قواعد قاعدة البيانات. مأخوذة من أفضل الممارسات.
> آخر تحديث: 2026-09-27

---

## 1. القاعدة الصفرية

- Supabase الحالي = يفضل زي ما هو.
- أي تعديل = migration جديدة.
- ممنوع تعديل DB مباشرة.
- ممنوع تشغيل SQL بدون فحص.

---

## 2. بنية الجداول

### 2.1 Primary Key

- كل جدول → uuid PK.
- ممنوع integer PK.
- ممنوع composite PK (إلا للحالات الخاصة).

### 2.2 Foreign Keys

- كل FK → REFERENCES مع ON DELETE.
- ON DELETE CASCADE للبيانات المرتبطة.
- ON DELETE SET NULL للبيانات المستقلة.

### 2.3 Timestamps

- كل جدول → created_at + updated_at.
- timestamptz (مش timestamp).
- DEFAULT now().

### 2.4 Naming

- snake_case للأعمدة والجداول.
- plural للجداول (profiles, businesses).
- _id للـ foreign keys.
- _at للـ timestamps.
- _count للـ counters.

---

## 3. الأعمدة

### 3.1 Types

- uuid للـ IDs.
- text للنصوص.
- integer للأرقام.
- boolean للحالات.
- timestamptz للتواريخ.
- jsonb للبيانات المرنة.

### 3.2 Nullable

- is_nullable = YES للأعمدة الاختيارية.
- is_nullable = NO للأعمدة الإجبارية.
- DEFAULT للقيم الافتراضية.

### 3.3 Indexes

- كل FK → index.
- كل عمود في WHERE → index.
- كل عمود في ORDER BY → index.
- Composite index للأعمدة المتكررة مع بعض.

---

## 4. RLS (Row Level Security)

### 4.1 القاعدة

- RLS على كل جدول.
- ممنوع تعطيل RLS.
- Policies واضحة + مختبرة.

### 4.2 Policy Types

- SELECT: public أو self أو admin.
- INSERT: self أو admin.
- UPDATE: owner أو admin.
- DELETE: owner أو admin.

### 4.3 is_admin()

- function SECURITY DEFINER.
- بتشيك على user_roles.role = 'super_admin'.
- تستخدم في كل policies الأدمن.

---

## 5. Functions

### 5.1 Naming

- verb_noun: get_user_points, award_daily_login.
- is_x: is_admin, is_business_owner.
- check_x: check_rate_limit.

### 5.2 Security

- SECURITY DEFINER للحساسة.
- SET search_path = public.
- Grants صح.

### 5.3 Testing

- اختبر كل function قبل الـ production.
- استخدم staging أول.
- بعدها production.

---

## 6. Migrations

### 6.1 Structure

- ملف واحد لكل migration.
- اسم واضح: 2026-09-27-normalize-profiles.sql.
- comment في الأول يشرح الهدف.

### 6.2 Rules

- IF NOT EXISTS لكل CREATE.
- DROP POLICY IF EXISTS قبل CREATE.
- ممنوع تعديل migration قديمة.
- migration جديدة للتعديلات.

### 6.3 Testing

- اختبر على staging أول.
- Backup قبل production.
- Rollback plan جاهز.

---

## 7. Performance

### 7.1 Indexes

- EXPLAIN ANALYZE للـ queries البطيئة.
- أضف indexes حسب الحاجة.
- ممنوع over-indexing.

### 7.2 Queries

- SELECT الأعمدة المطلوبة بس.
- LIMIT دايماً.
- WHERE على indexed columns.
- ممنوع SELECT * في production.

### 7.3 Caching

- unstable_cache للـ public reads.
- revalidate حسب الحاجة.
- tags للـ invalidation.

---

## 8. Security

### 8.1 Service Role

- Server only.
- ممنوع على client.
- bypass RLS — استخدم بحذر.

### 8.2 Secrets

- .env.local — ممنوع في Git.
- Service Role Key — server only.
- ممنوع NEXT_PUBLIC_ لحاجة حساسة.

### 8.3 Audit

- كل عملية إدارية → audit_logs.
- ممنوع حذف audit logs.
- retention policy واضحة.

---

## 9. Backups

### 9.1 Supabase

- PITR مفعّل (Pro plan).
- Daily backups.
- Manual backups قبل migrations كبيرة.

### 9.2 Testing

- اختبر restore process.
- تأكد من البيانات.
- سجّل العملية.

---

## 10. الخلاصة

القاعدة الذهبية:
- ممنوع تعديل بدون migration.
- ممنوع migration بدون backup.
- ممنوع RLS بدون اختبار.
- ممنوع Service Role على client.

الهدف: قاعدة بيانات نظيفة + آمنة + سريعة.

---

آخر تحديث: 2026-09-27
