import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import { ROLE_LABEL } from '@/lib/profile-presets'
import RoyalAvatar from '@/components/royal-avatar'
import EnablePushButton from '@/components/enable-push-button'
import '@/components/royal-avatar.css'
import './account.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'حسابي' }

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/auth')

  const user = userData.user

  const [
    { data: profile },
    { data: roleRow },
    { count: favCount },
    { count: reviewCount },
    { count: notifCount },
    { data: sub },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('display_name,phone,trust_score,created_at,banned_until,ban_reason,avatar_key,bio,gender,verified_at,avatar_url')
      .eq('id', user.id)
      .maybeSingle(),
    supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle(),
    supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('business_reviews').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', user.id).is('read_at', null),
    supabase
      .from('business_subscriptions')
      .select('status,expires_at')
      .eq('owner_id', user.id)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .limit(1)
      .maybeSingle(),
  ])

  const role = roleRow?.role ?? 'customer'
  const roleLabel = ROLE_LABEL[role] ?? role
  const isBanned = !!(profile?.banned_until && new Date(profile.banned_until) > new Date())
  const isVerified = !!profile?.verified_at
  const isPremium = !!sub
  const name = profile?.display_name ?? 'مستخدم'
  const trustScore = profile?.trust_score ?? 0
  const trustPct = Math.min(100, Math.max(0, trustScore))
  const joinedAt = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' })
    : '—'

  return (
    <>
      <FloatingCapsuleHeader />
      <main className="acc">
        <section className="acc-hero">
          <div className="acc-hero__glow" aria-hidden />

          <div className="acc-hero__avatar-wrap">
            <RoyalAvatar
              name={name}
              avatarKey={profile?.avatar_key}
              avatarUrl={profile?.avatar_url}
              role={role}
              isPremium={isPremium}
              verified={isVerified}
              size="lg"
            />
          </div>

          <div className="acc-hero__body">
            <span className="acc-hero__kicker">حسابي</span>
            <h1 className="acc-hero__title">{name}</h1>

            <div className="acc-hero__meta">
              <span className="acc-chip acc-chip--role">{roleLabel}</span>
              {isPremium && <span className="acc-chip acc-chip--premium">مميز</span>}
              {isVerified && <span className="acc-chip acc-chip--verified">✓ موثّق</span>}
              {isBanned && <span className="acc-chip acc-chip--banned">🚫 محظور</span>}
            </div>

            {profile?.bio && <p className="acc-hero__bio">{profile.bio}</p>}
          </div>

          <Link href="/account/edit" className="acc-hero__edit">
            ✏️ تعديل
          </Link>
        </section>

        {isBanned && (
          <div className="acc-ban">
            <strong className="acc-ban__title">🚫 حسابك محظور مؤقتًا</strong>
            <p className="acc-ban__text">السبب: {profile?.ban_reason ?? 'غير محدد'}</p>
            <p className="acc-ban__text">
              ينتهي في: {new Date(profile!.banned_until!).toLocaleDateString('ar-EG')}
            </p>
          </div>
        )}

        <section className="acc-grid">
          {role !== 'super_admin' && (
            <div className="acc-card acc-card--third">
              <span className="acc-card__emoji"></span>
              <span className="acc-card__value" style={{ color: '#FBBF24' }}>{trustScore}</span>
              <span className="acc-card__label">نقاط الثقة</span>
              <div className="acc-trust-bar">
                <div className="acc-trust-bar__fill" style={{ width: `${trustPct}%` }} />
              </div>
            </div>
          )}

          <div className="acc-card acc-card--third">
            <span className="acc-card__emoji">❤️</span>
            <span className="acc-card__value" style={{ color: '#FB923C' }}>{favCount ?? 0}</span>
            <span className="acc-card__label">مفضلة</span>
          </div>

          <div className="acc-card acc-card--third">
            <span className="acc-card__emoji"></span>
            <span className="acc-card__value" style={{ color: '#C084FC' }}>{reviewCount ?? 0}</span>
            <span className="acc-card__label">تقييمات</span>
          </div>

          <div className="acc-card acc-card--half">
            <span className="acc-card__emoji"></span>
            <span className="acc-card__value" style={{ color: '#A855F7' }}>{notifCount ?? 0}</span>
            <span className="acc-card__label">إشعارات جديدة</span>
          </div>

          <div className="acc-card acc-card--half">
            <span className="acc-card__emoji">📅</span>
            <span className="acc-card__value" style={{ fontSize: '1.1rem', color: '#C4B5FD' }}>{joinedAt}</span>
            <span className="acc-card__label">عضو معانا من</span>
          </div>
        </section>

        <section className="acc-section">
          <div className="acc-section__head">
            <h2 className="acc-section__title">إجراءات سريعة</h2>
          </div>
          <div className="acc-actions">
            <Link href="/explore" className="acc-action">
              <span className="acc-action__emoji"></span> اكتشف الأماكن
            </Link>
            <Link href="/recommend" className="acc-action acc-action--primary">
              <span className="acc-action__emoji"></span> نفسك في ايه؟
            </Link>
            <Link href="/offers" className="acc-action">
              <span className="acc-action__emoji"></span> العروض
            </Link>
            <Link href="/account/edit" className="acc-action acc-action--primary">
              <span className="acc-action__emoji">✏️</span> تعديل البروفايل
            </Link>
            <Link href="/account/notifications" className="acc-action">
              <span className="acc-action__emoji"></span> الإشعارات
            </Link>
            <Link href="/account/orders" className="acc-action">
              <span className="acc-action__emoji"></span> طلباتي
            </Link>
            <Link href="/account/points" className="acc-action">
              <span className="acc-action__emoji"></span> نقاطي
            </Link>
            <Link href="/account/referral" className="acc-action">
              <span className="acc-action__emoji"></span> ادعي صحابك
            </Link>
            {!isVerified && (
              <Link href="/account/verify" className="acc-action acc-action--primary">
                <span className="acc-action__emoji">✓</span> وثّق حسابك
              </Link>
            )}
            <Link href="/auth/change-password" className="acc-action">
              <span className="acc-action__emoji"></span> تغيير كلمة السر
            </Link>
            {role === 'merchant' && (
              <Link href="/merchant" className="acc-action acc-action--primary">
                <span className="acc-action__emoji"></span> لوحة النشاط
              </Link>
            )}
            {role === 'super_admin' && (
              <Link href="/admin" className="acc-action acc-action--primary">
                <span className="acc-action__emoji"></span> لوحة التحكم
              </Link>
            )}
          </div>
        </section>

        <section className="acc-section">
          <div className="acc-section__head">
            <h2 className="acc-section__title">معلومات الحساب</h2>
          </div>
          <div className="acc-info">
            <div className="acc-info__row">
              <span className="acc-info__label">الاسم</span>
              <span className="acc-info__value">{name}</span>
            </div>
            <div className="acc-info__row">
              <span className="acc-info__label">الموبايل</span>
              <span className="acc-info__value">{profile?.phone ?? '—'}</span>
            </div>
            <div className="acc-info__row">
              <span className="acc-info__label">حالة التوثيق</span>
              <span className="acc-info__value">{isVerified ? '✓ موثّق' : 'غير موثّق'}</span>
            </div>
            <div className="acc-info__row">
              <span className="acc-info__label">نوع الحساب</span>
              <span className="acc-info__value">{roleLabel}</span>
            </div>
            {isPremium && (
              <div className="acc-info__row">
                <span className="acc-info__label">الاشتراك</span>
                <span className="acc-info__value">مميز</span>
              </div>
            )}
          </div>
        </section>

        <section className="acc-push">
          <div className="acc-push__text">
            <span className="acc-push__title">الإشعارات</span>
            <span className="acc-push__hint">فعّل الإشعارات عشان توصلك العروض والتقييمات</span>
          </div>
          <EnablePushButton />
        </section>

        <section className="acc-logout">
          <div className="acc-logout__text">
            <span className="acc-logout__title">🚪 تسجيل الخروج</span>
            <span className="acc-logout__hint">هتخرج من حسابك على الجهاز ده</span>
          </div>
          <form action="/auth/logout" method="post">
            <button type="submit" className="acc-logout__btn">تسجيل خروج</button>
          </form>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
