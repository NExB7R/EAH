import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import ReviewActions from '@/components/admin/review-actions'
import { IcSmile } from '@/components/eah-icons'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'التقييمات' }

type Review = {
  id: string
  business_id: string
  user_id: string
  taste: number
  value_for_money: number
  speed: number
  experience: number
  comment: string | null
  status: string
  created_at: string
  businesses: { name: string; slug: string } | null
  profiles: { display_name: string | null } | null
}

function Stars({ value }: { value: number }) {
  const r = Math.round(value)
  return (
    <span className="review-card__stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`review-card__star ${i <= r ? 'is-on' : ''}`}>★</span>
      ))}
    </span>
  )
}

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/admin/login')

  const { data: roleRow } = await supabase
    .from('user_roles').select('role').eq('user_id', userData.user.id).maybeSingle()
  if (roleRow?.role !== 'super_admin') redirect('/')

  const params = await searchParams
  const statusFilter = params.status

  let query = supabase
    .from('business_reviews')
    .select('id,business_id,user_id,taste,value_for_money,speed,experience,comment,status,created_at,businesses(name,slug),profiles(display_name)')
    .order('created_at', { ascending: false })
    .limit(200)

  if (statusFilter) {
    query = query.eq('status', statusFilter)
  }

  const { data, error } = await query
  if (error) {
    return (
      <div className="admin-empty">
        <span className="admin-empty__emoji"></span>
        <h2 className="admin-empty__title">حصل خطأ</h2>
        <p className="admin-empty__msg">{error.message}</p>
      </div>
    )
  }

  const rows = (data ?? []) as unknown as Review[]
  const counts = {
    all: rows.length,
    pending: rows.filter(r => r.status === 'pending').length,
    approved: rows.filter(r => r.status === 'approved').length,
    hidden: rows.filter(r => r.status === 'hidden').length,
    rejected: rows.filter(r => r.status === 'rejected').length,
  }

  return (
    <>
      <div className="admin-header">
        <div className="admin-header__info">
          <span className="admin-header__kicker">التقييمات</span>
          <h1 className="admin-header__title">التقييمات</h1>
          <p className="admin-header__subtitle">
            {counts.all} تقييم — {counts.pending} قيد المراجعة، {counts.approved} معتمد
          </p>
        </div>
      </div>

      <div className="admin-toolbar" style={{ marginBottom: 16 }}>
        <Link href="/admin/reviews" className={`admin-btn admin-btn--sm ${!statusFilter ? 'admin-btn--primary' : ''}`}>الكل</Link>
        <Link href="/admin/reviews?status=pending" className={`admin-btn admin-btn--sm ${statusFilter === 'pending' ? 'admin-btn--primary' : ''}`}>⏰ قيد المراجعة ({counts.pending})</Link>
        <Link href="/admin/reviews?status=approved" className={`admin-btn admin-btn--sm ${statusFilter === 'approved' ? 'admin-btn--primary' : ''}`}>معتمد ({counts.approved})</Link>
        <Link href="/admin/reviews?status=hidden" className={`admin-btn admin-btn--sm ${statusFilter === 'hidden' ? 'admin-btn--primary' : ''}`}>مخفي ({counts.hidden})</Link>
        <Link href="/admin/reviews?status=rejected" className={`admin-btn admin-btn--sm ${statusFilter === 'rejected' ? 'admin-btn--primary' : ''}`}>مرفوض ({counts.rejected})</Link>
      </div>

      {rows.length === 0 ? (
        <div className="admin-empty">
          <span className="admin-empty__emoji"></span>
          <h2 className="admin-empty__title">مفيش تقييمات</h2>
        </div>
      ) : (
        <div className="admin-grid admin-grid--cards">
          {rows.map((r) => {
            const avg = (r.taste + r.value_for_money + r.speed + r.experience) / 4
            return (
              <article key={r.id} className="review-card">
                <div className="review-card__head">
                  <div style={{ flex: 1 }}>
                    {r.businesses && (
                      <Link href={`/businesses/${r.businesses.slug}`} target="_blank" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ fontFamily: 'var(--eah-font-display)', fontSize: '0.95rem', fontWeight: 900, color: 'var(--eah-text)' }}>
                          {r.businesses.name}
                        </div>
                      </Link>
                    )}
                    <div style={{ fontFamily: 'var(--eah-font-body)', fontSize: '0.72rem', color: 'var(--eah-text-4)' }}>
                      {r.profiles?.display_name ?? 'زائر'} • {new Date(r.created_at).toLocaleDateString('ar-EG')}
                    </div>
                  </div>
                  <div>
                    <Stars value={avg} />
                    <div style={{ fontSize: '0.7rem', color: 'var(--eah-gold)', fontWeight: 900, textAlign: 'center' }}>{avg.toFixed(1)}</div>
                  </div>
                </div>

                <div className="review-card__ratings">
                  <div className="review-card__rating-item">
                    <span className="review-card__rating-label"><IcSmile /> طعم</span>
                    <span className="review-card__rating-value">{r.taste}</span>
                  </div>
                  <div className="review-card__rating-item">
                    <span className="review-card__rating-label">قيمة</span>
                    <span className="review-card__rating-value">{r.value_for_money}</span>
                  </div>
                  <div className="review-card__rating-item">
                    <span className="review-card__rating-label">سرعة</span>
                    <span className="review-card__rating-value">{r.speed}</span>
                  </div>
                  <div className="review-card__rating-item">
                    <span className="review-card__rating-label">تجربة</span>
                    <span className="review-card__rating-value">{r.experience}</span>
                  </div>
                </div>

                {r.comment && <p className="review-card__comment">{r.comment}</p>}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <span className={`admin-biz__badge ${r.status === 'approved' ? 'admin-biz__badge--published' : ''}`}>
                    {r.status === 'pending' ? '⏰ قيد المراجعة' : r.status === 'approved' ? 'معتمد' : r.status === 'hidden' ? 'مخفي' : 'مرفوض'}
                  </span>
                </div>

                <ReviewActions reviewId={r.id} status={r.status} />
              </article>
            )
          })}
        </div>
      )}
    </>
  )
}
