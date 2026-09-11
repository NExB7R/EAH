import { createClient } from '@/lib/supabase-server'

export default async function AdminReviewsPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('business_reviews')
    .select('id,business_id,user_id,status,comment,taste,value_for_money,speed,experience,created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <section>
      <header className="eah-admin-header"><div><span className="eah-admin-kicker">MODERATION</span><h1>التقييمات والتعليقات</h1><p>هنا هنراجع الجديد ونوافق أو نخفي أو نرفض التقييمات.</p></div></header>
      {error ? <p className="lead">{error.message}</p> : data?.length ? <div className="eah-admin-business-list">{data.map(review => <article key={review.id} className="eah-admin-business-card"><div><div className="eah-admin-business-name">مراجعة #{review.id.slice(0,8)}</div><div className="eah-admin-business-sub">الحالة: {review.status} • {review.comment || 'بدون تعليق'}</div></div><div className="eah-admin-actions"><span className="eah-admin-badge">طعم {review.taste ?? '—'}</span><span className="eah-admin-badge">قيمة {review.value_for_money ?? '—'}</span><span className="eah-admin-badge">سرعة {review.speed ?? '—'}</span></div></article>)}</div> : <div className="eah-admin-command-card"><strong>لا توجد مراجعات بعد</strong><span>القسم جاهز، وبمجرد وصول أول تقييم هيظهر هنا.</span></div>}
    </section>
  )
}
