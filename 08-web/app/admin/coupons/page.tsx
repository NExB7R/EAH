import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { getPendingCoupons } from '@/lib/coupons'
import CouponAdminCard from '@/components/coupons/coupon-admin-card'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'مراجعة الكوبونات' }

export default async function AdminCouponsPage() {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/auth')

  const { data: role } = await sb
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'super_admin')
    .maybeSingle()
  if (!role) redirect('/')

  const pending = await getPendingCoupons()
  const bizIds = [...new Set(pending.map((c) => c.business_id))]
  let names: Record<string, string> = {}
  if (bizIds.length) {
    const { data } = await sb.from('businesses').select('id,name').in('id', bizIds)
    for (const b of data ?? []) names[b.id] = b.name
  }

  return (
    <>
      <FloatingCapsuleHeader />
      <main className="acc-page">
        <h1 className="acc-title">مراجعة الكوبونات</h1>
        <p className="acc-sub">{pending.length} كوبون منتظر</p>
        {pending.length === 0 ? (
          <div className="acc-empty">مفيش كوبونات منتظرة</div>
        ) : (
          <div className="cac-grid">
            {pending.map((c) => (
              <CouponAdminCard key={c.id} coupon={c} businessName={names[c.business_id] ?? '—'} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
