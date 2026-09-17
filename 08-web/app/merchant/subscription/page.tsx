import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { getActivePlans, getBusinessSubscription, statusLabel, statusColor } from '@/lib/subscription'
import SubscriptionBadge from '@/components/subscription/subscription-badge'
import TrialCountdown from '@/components/subscription/trial-countdown'
import UpgradeCTA from '@/components/subscription/upgrade-cta'
import './subscription.css'
import { IcCheck, IcDiamond } from '@/components/eah-icons'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'اشتراكي' }

export default async function MerchantSubscriptionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth?next=/merchant/subscription')

  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name, slug, business_type')
    .eq('owner_profile_id', user.id)
    .limit(1)

  const business = businesses?.[0]
  if (!business) {
    return (
      <main className="msub msub--empty">
        <h1>مفيش نشاط مرتبط بحسابك</h1>
        <Link href="/merchant/apply" className="msub__btn">سجّل نشاطك</Link>
      </main>
    )
  }

  const [sub, plans] = await Promise.all([
    getBusinessSubscription(business.id),
    getActivePlans(),
  ])

  const active = sub && (sub.status === 'trial' || sub.status === 'active')

  return (
    <main className="msub">
      <header className="msub__head">
        <div>
          <span className="msub__kicker">الاشتراك</span>
          <h1>اشتراكي 💎</h1>
          <p className="msub__sub">{business.name}</p>
        </div>
        <Link href="/merchant" className="msub__back">← رجوع</Link>
      </header>

      {active && sub ? (
        <>
          <div className="msub__hero">
            <TrialCountdown expiresAt={sub.expires_at!} status={sub.status as 'trial' | 'active'} />
          </div>

          <div className="msub__info">
            <div className="msub__row">
              <span>الباقة</span>
              <strong>{sub.plan_name ?? '—'}</strong>
            </div>
            <div className="msub__row">
              <span>الحالة</span>
              <span
                className="msub__status"
                style={{ background: `${statusColor(sub.status)}20`, color: statusColor(sub.status) }}
              >
                {statusLabel(sub.status)}
              </span>
            </div>
            <div className="msub__row">
              <span>المميزات</span>
              <div className="msub__features">
                {sub.features?.map((f) => (
                  <span key={f} className="msub__feat"><IcCheck /> {f}</span>
                ))}
              </div>
            </div>
            <div className="msub__row">
              <span>الشارة الحالية</span>
              <SubscriptionBadge variant="gold" label="مميز" />
            </div>
          </div>

          <UpgradeCTA
            businessId={business.id}
            plans={plans}
            currentPlanCode={sub.plan_code}
          />
        </>
      ) : sub?.status === 'pending' ? (
        <div className="msub__pending">
          <span className="msub__pending-emoji">⏳</span>
          <h2>طلبك قيد المراجعة</h2>
          <p>الإدارة بتراجع طلبك، هتوصلك رسالة أول ما يتم الرد.</p>
          <Link href="/merchant" className="msub__btn">رجوع للنشاط</Link>
        </div>
      ) : (
        <>
          <div className="msub__empty-state">
            <span className="msub__empty-emoji"><IcDiamond /></span>
            <h2>مشتركش في باقة مميزة بعد</h2>
            <p>ارقى لباقة مميزة عشان تاخد شارة + أولوية + إعلانات</p>
          </div>
          <UpgradeCTA businessId={business.id} plans={plans} />
        </>
      )}
    </main>
  )
}
