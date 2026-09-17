import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import { submitVerification } from './actions'
import './verify.css'
import { IcCheck, IcScroll } from '@/components/eah-icons'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'توثيق الحساب' }

const CHECK_LABELS: Record<string, string> = {
  phone_verified: 'رقم موبايل موثق',
  account_age:    'الحساب عمره 7 أيام+',
  trust_score:    'نقاط الثقة 50+',
  not_banned:     'مفيش بان نشط',
  activity:       '3+ تقييمات أو 5+ مفضلات',
  real_name:      'اسم من كلمتين على الأقل',
}

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>
}) {
  const { sent } = await searchParams
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/auth?next=/account/verify')

  const [{ data: profile }, { data: eligibility }, { data: requests }] = await Promise.all([
    supabase.from('profiles').select('verified_at,display_name').eq('id', userData.user.id).maybeSingle(),
    supabase.rpc('check_verification_eligibility', { p_user_id: userData.user.id }),
    supabase
      .from('verification_requests')
      .select('id,status,real_name,admin_note,created_at,reviewed_at')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false }),
  ])

  const isVerified = !!profile?.verified_at
  const checks = eligibility?.checks ?? {}
  const stats = eligibility?.stats ?? {}
  const canApply = eligibility?.eligible === true
  const hasPending = (requests ?? []).some(r => r.status === 'pending')

  return (
    <>
      <FloatingCapsuleHeader />
      <main className="vf">
        <header className="vf-hero">
          <div className="vf-hero__glow" aria-hidden />
          <Link href="/account" className="vf-hero__back">← رجوع</Link>
          <span className="vf-hero__kicker">توثيق EAH</span>
          <h1 className="vf-hero__title"><IcCheck /> توثيق الحساب</h1>
          <p className="vf-hero__lead">
            التوثيق بيدي حسابك شارة "موثق" تظهر في كل مكان على EAH.
          </p>
        </header>

        {isVerified && (
          <div className="vf-alert vf-alert--success">
            <span className="vf-alert__emoji"></span>
            <div>
              <strong className="vf-alert__title">حسابك موثق بالفعل</strong>
              <p className="vf-alert__text">الشارة ✓ ظاهرة في بروفايلك.</p>
            </div>
          </div>
        )}

        {sent === '1' && !isVerified && (
          <div className="vf-alert vf-alert--info">
            <span className="vf-alert__emoji"></span>
            <div>
              <strong className="vf-alert__title">تم إرسال طلبك</strong>
              <p className="vf-alert__text">فريق EAH هيراجعه وهيرد عليك قريب.</p>
            </div>
          </div>
        )}

        {!isVerified && !hasPending && (
          <section className="vf-checks">
            <h2 className="vf-section-title">شروط التوثيق</h2>
            <div className="vf-checks__list">
              {Object.entries(CHECK_LABELS).map(([key, label]) => {
                const ok = checks[key] === true
                return (
                  <div key={key} className={`vf-check ${ok ? 'vf-check--ok' : 'vf-check--missing'}`}>
                    <span className="vf-check__icon">{ok ? '' : '⬜'}</span>
                    <span className="vf-check__label">{label}</span>
                  </div>
                )
              })}
            </div>
            <div className="vf-stats">
              <div className="vf-stat">
                <span className="vf-stat__value">{stats.trust_score ?? 0}</span>
                <span className="vf-stat__label">نقاط الثقة</span>
              </div>
              <div className="vf-stat">
                <span className="vf-stat__value">{stats.review_count ?? 0}</span>
                <span className="vf-stat__label">تقييمات</span>
              </div>
              <div className="vf-stat">
                <span className="vf-stat__value">{stats.favorite_count ?? 0}</span>
                <span className="vf-stat__label">مفضلة</span>
              </div>
              <div className="vf-stat">
                <span className="vf-stat__value">{stats.account_age_days ?? 0}</span>
                <span className="vf-stat__label">يوم معانا</span>
              </div>
            </div>
          </section>
        )}

        {!isVerified && hasPending && (
          <div className="vf-alert vf-alert--pending">
            <span className="vf-alert__emoji"></span>
            <div>
              <strong className="vf-alert__title">طلبك قيد المراجعة</strong>
              <p className="vf-alert__text">هنتواصل معاك بعد ما الإدارة تراجع طلبك.</p>
            </div>
          </div>
        )}

        {!isVerified && !hasPending && canApply && (
          <section className="vf-form">
            <h2 className="vf-section-title">بيانات التوثيق</h2>
            <form action={submitVerification} className="vf-form__inner">
              <label className="vf-field">
                <span className="vf-field__label">الاسم الكامل (كما في البطاقة) *</span>
                <input
                  name="real_name"
                  required
                  minLength={4}
                  maxLength={80}
                  placeholder="مثلاً: أحمد محمد علي"
                  className="vf-input"
                />
              </label>

              <label className="vf-field">
                <span className="vf-field__label">الرقم القومي (اختياري)</span>
                <input
                  name="national_id"
                  dir="ltr"
                  inputMode="numeric"
                  maxLength={14}
                  placeholder="14 رقم"
                  className="vf-input"
                />
              </label>

              <label className="vf-field">
                <span className="vf-field__label">سبب طلب التوثيق (اختياري)</span>
                <textarea
                  name="reason"
                  maxLength={300}
                  rows={3}
                  placeholder="مثلاً: عايز أضيف مطعمي على EAH"
                  className="vf-textarea"
                />
              </label>

              <button type="submit" className="vf-submit"><IcCheck /> قدّم طلب التوثيق
              </button>
            </form>
          </section>
        )}

        {!isVerified && !hasPending && !canApply && (
          <div className="vf-alert vf-alert--warning">
            <span className="vf-alert__emoji"></span>
            <div>
              <strong className="vf-alert__title">مش مستوفي الشروط</strong>
              <p className="vf-alert__text">كمّل الشروط الناقصة فوق وحاول تاني.</p>
            </div>
          </div>
        )}

        {(requests ?? []).length > 0 && (
          <section className="vf-history">
            <h2 className="vf-section-title"><IcScroll /> تاريخ طلباتك</h2>
            <div className="vf-history__list">
              {(requests ?? []).map(r => (
                <div key={r.id} className="vf-history__item">
                  <div className="vf-history__head">
                    <span className="vf-history__name">{r.real_name}</span>
                    <span className={`vf-status vf-status--${r.status}`}>
                      {r.status === 'pending' && 'قيد المراجعة'}
                      {r.status === 'approved' && 'مقبول'}
                      {r.status === 'rejected' && 'مرفوض'}
                    </span>
                  </div>
                  <span className="vf-history__date">
                    {new Date(r.created_at).toLocaleDateString('ar-EG')}
                  </span>
                  {r.admin_note && <p className="vf-history__note">{r.admin_note}</p>}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
