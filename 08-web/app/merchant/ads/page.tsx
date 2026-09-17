import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import './ads-list.css'
import { IcCalendar, IcEye, IcMegaphone, IcMouse } from '@/components/eah-icons'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'إعلاناتي' }

const STATUS_LABEL: Record<string, { l: string; c: string }> = {
  pending: { l: 'مراجعة', c: 'is-pending' },
  active: { l: 'شغال', c: 'is-active' },
  paused: { l: 'موقف', c: 'is-paused' },
  expired: { l: 'منتهي', c: 'is-expired' },
  rejected: { l: 'مرفوض', c: 'is-rejected' },
}

export default async function MyAdsPage() {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) redirect('/auth?next=/merchant/ads')

  const { data: ads } = await supabase
    .from('ads')
    .select('*, slot:ad_slots(code,name_ar)')
    .eq('owner_profile_id', user.user.id)
    .order('created_at', { ascending: false })

  return (
    <main className="mads">
      <header className="mads__hero">
        <Link href="/merchant" className="mads__back">← لوحة النشاط</Link>
        <span className="mads__kicker">إعلاناتي</span>
        <h1 className="mads__title"><IcMegaphone /> إعلاناتك على EAH</h1>
        <p className="mads__sub">شوف أداء إعلاناتك وحالتها</p>
        <Link href="/merchant/ads/new" className="mads__cta">+ إعلان جديد</Link>
      </header>

      {(!ads || ads.length === 0) ? (
        <div className="mads__empty">
          <span className="mads__empty-emoji"><IcMegaphone /></span>
          <p>لسه مفيش إعلانات</p>
          <Link href="/merchant/ads/new" className="mads__cta">اطلب أول إعلان</Link>
        </div>
      ) : (
        <div className="mads__list">
          {ads.map((a) => {
            const st = STATUS_LABEL[a.status] ?? STATUS_LABEL.pending
            return (
              <article key={a.id} className="mad">
                {a.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.image_url} alt={a.title} className="mad__img" />
                )}
                <div className="mad__body">
                  <div className="mad__head">
                    <h3 className="mad__title">{a.title}</h3>
                    <span className={`mad__status ${st.c}`}>{st.l}</span>
                  </div>
                  <span className="mad__slot">{(a as any).slot?.name_ar ?? '—'}</span>
                  {a.description && <p className="mad__desc">{a.description}</p>}
                  <div className="mad__stats">
                    <span><IcEye /> {a.impressions}</span>
                    <span><IcMouse /> {a.clicks}</span>
                    {a.ends_at && <span><IcCalendar /> ينتهي: {new Date(a.ends_at).toLocaleDateString('ar-EG')}</span>}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </main>
  )
}
