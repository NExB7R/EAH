import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import PromoAdminCard from '@/components/promo/promo-admin-card'
import '@/components/promo/promo.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'مراجعة المشاركات' }

export default async function AdminPromoPage() {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/auth')

  const { data: role } = await sb
    .from('user_roles').select('role').eq('user_id', user.id).eq('role', 'super_admin').maybeSingle()
  if (!role) redirect('/')

  const { data: posts } = await sb
    .from('promo_posts')
    .select('*, business:businesses(name,slug)')
    .order('created_at', { ascending: true })

  const pending = (posts ?? []).filter((p) => p.status === 'pending')
  const reviewed = (posts ?? []).filter((p) => p.status !== 'pending')

  return (
    <main className="e-page">
      <h1 className="e-page__title">مراجعة المشاركات</h1>
      <p className="e-page__sub">{pending.length} طلب منتظر</p>

      {pending.length === 0 ? (
        <div className="promo-empty">مفيش طلبات معلقة</div>
      ) : (
        <div className="promo-grid">
          {pending.map((p: any) => (
            <PromoAdminCard
              key={p.id}
              id={p.id}
              businessName={p.business?.name ?? '—'}
              postUrl={p.post_url}
              note={p.note}
              createdAt={p.created_at}
            />
          ))}
        </div>
      )}

      {reviewed.length > 0 && (
        <>
          <h2 className="e-section__title" style={{ marginTop: 32 }}>تمت المراجعة</h2>
          <ul className="promo-status__list">
            {reviewed.slice(0, 20).map((p: any) => (
              <li key={p.id} className={`promo-status__item promo-status__item--${p.status}`}>
                <strong>{p.business?.name}</strong>
                <span className={`promo-badge promo-badge--${p.status}`}>
                  {p.status === 'approved' ? 'موافقة' : 'رفض'}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  )
}
