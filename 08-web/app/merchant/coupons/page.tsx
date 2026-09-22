import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { getMerchantCoupons, couponLabel } from '@/lib/coupons'
import CouponForm from '@/components/coupons/coupon-form'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'الكوبونات' }

export default async function MerchantCouponsPage() {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/auth?next=/merchant/coupons')

  const { data: biz } = await sb
    .from('businesses')
    .select('id,name,slug')
    .eq('owner_profile_id', user.id)
    .maybeSingle()

  if (!biz) {
    return (
      <>
        <FloatingCapsuleHeader />
        <main className="e-page">
          <h1 className="acc-title e-gradient">الكوبونات</h1>
          <p className="e-page__sub">لازم تكون صاحب نشاط</p>
        </main>
        <SiteFooter />
      </>
    )
  }

  const coupons = await getMerchantCoupons(biz.id)

  return (
    <>
      <FloatingCapsuleHeader />
      <main className="e-page">
        <h1 className="acc-title e-gradient">كوبونات {biz.name}</h1>
        <p className="e-page__sub">أضف عرضك — هيظهر بعد موافقة الإدارة</p>

        <CouponForm businessId={biz.id} />

        {coupons.length > 0 && (
          <>
            <h2 className="mc-title">كوبوناتك</h2>
            <ul className="mc-list">
              {coupons.map((c) => (
                <li key={c.id} className={`mc-item mc-${c.status}`}>
                  <div className="mc-head">
                    <span className="mc-code">{c.code}</span>
                    <span className={`mc-status mc-s-${c.status}`}>
                      {c.status === 'approved' ? 'مفعّل' : c.status === 'pending' ? 'منتظر' : 'مرفوض'}
                    </span>
                  </div>
                  <div className="mc-title-row">{c.title}</div>
                  <div className="mc-meta">{couponLabel(c)} · استُخدم {c.uses_count}{c.max_uses ? `/${c.max_uses}` : ''}</div>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
