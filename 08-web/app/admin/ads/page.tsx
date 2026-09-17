import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import './ads.css'
import { IcEye, IcMegaphone } from '@/components/eah-icons'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'إدارة الإعلانات' }

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending: { label: 'مراجعة', cls: 'is-pending' },
  active: { label: 'شغال', cls: 'is-active' },
  paused: { label: 'موقف', cls: 'is-paused' },
  expired: { label: 'منتهي', cls: 'is-expired' },
  rejected: { label: 'مرفوض', cls: 'is-rejected' },
}

export default async function AdminAdsPage() {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) redirect('/admin/login')
  const { data: role } = await supabase.from('user_roles').select('role').eq('user_id', user.user.id).maybeSingle()
  if (role?.role !== 'super_admin') redirect('/')

  const [{ data: slots }, { data: ads }] = await Promise.all([
    supabase.from('ad_slots').select('*').order('display_order'),
    supabase.from('ads').select('*, slot:ad_slots(code,name_ar)').order('created_at', { ascending: false }).limit(50),
  ])

  const bySlot = new Map<string, number>()
  for (const a of ads ?? []) {
    if (a.status === 'active') bySlot.set(a.slot_id, (bySlot.get(a.slot_id) ?? 0) + 1)
  }

  return (
    <main className="ads">
      <header className="ads__hero">
        <Link href="/admin" className="ads__back">← غرفة التحكم</Link>
        <span className="ads__kicker">إدارة الإعلانات</span>
        <h1 className="ads__title"><IcMegaphone /> الإعلانات والمساحات</h1>
        <p className="ads__sub">إدارة المساحات الإعلانية، مراجعة الإعلانات، وتتبع الأداء</p>
      </header>

      <section className="ads__slots">
        <h2 className="ads__section-title">المساحات</h2>
        <div className="ads__slots-grid">
          {(slots ?? []).map((s) => {
            const active = bySlot.get(s.id) ?? 0
            const full = active >= s.max_concurrent
            return (
              <article key={s.id} className={`ad-slot ${full ? 'is-full' : ''}`}>
                <span className="ad-slot__code">{s.code}</span>
                <h3 className="ad-slot__name">{s.name_ar}</h3>
                <p className="ad-slot__desc">{s.description}</p>
                <div className="ad-slot__stats">
                  <span className="ad-slot__stat">
                    <b>{active}</b> / {s.max_concurrent} شغال
                  </span>
                  {s.base_price_egp && <span className="ad-slot__stat">{s.base_price_egp} ج.م</span>}
                </div>
                <Link href={`/admin/ads/slots/${s.id}`} className="ad-slot__cta">
                  إدارة ←
                </Link>
              </article>
            )
          })}
        </div>
      </section>

      <section className="ads__list">
        <h2 className="ads__section-title">كل الإعلانات ({ads?.length ?? 0})</h2>
        {(!ads || ads.length === 0) ? (
          <p className="ads__empty">لسه مفيش إعلانات</p>
        ) : (
          <div className="ads__table">
            {ads.map((a) => {
              const st = STATUS_LABEL[a.status] ?? STATUS_LABEL.pending
              return (
                <Link key={a.id} href={`/admin/ads/${a.id}`} className="ads__row">
                  <div className="ads__row-main">
                    <strong className="ads__row-title">{a.title}</strong>
                    <span className="ads__row-slot">
                      {(a as any).slot?.name_ar ?? '—'}
                    </span>
                  </div>
                  <span className={`ads__status ${st.cls}`}>{st.label}</span>
                  <div className="ads__row-stats">
                    <span title="ظهور"><IcEye /> {a.impressions}</span>
                    <span title="ضغط">🖱 {a.clicks}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
