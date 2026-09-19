type Post = {
  id: string
  post_url: string | null
  status: 'pending' | 'approved' | 'rejected'
  review_note: string | null
  days_granted: number | null
  created_at: string
  reviewed_at: string | null
}

const LABELS: Record<Post['status'], string> = {
  pending: 'قيد المراجعة',
  approved: 'تمت الموافقة',
  rejected: 'مرفوض',
}

export default function PromoStatus({ posts }: { posts: Post[] }) {
  return (
    <section className="promo-status">
      <h3 className="promo-status__title">طلباتك</h3>
      <ul className="promo-status__list">
        {posts.map((p) => (
          <li key={p.id} className={`promo-status__item promo-status__item--${p.status}`}>
            <div className="promo-status__head">
              <span className={`promo-badge promo-badge--${p.status}`}>{LABELS[p.status]}</span>
              <span className="promo-status__date">
                {new Date(p.created_at).toLocaleDateString('ar-EG')}
              </span>
            </div>
            {p.post_url && (
              <a href={p.post_url} target="_blank" rel="noreferrer" className="promo-status__link" dir="ltr">
                {p.post_url}
              </a>
            )}
            {p.status === 'approved' && p.days_granted && (
              <p className="promo-status__ok">✓ +{p.days_granted} يوم اتضافوا لاشتراكك</p>
            )}
            {p.review_note && <p className="promo-status__note">{p.review_note}</p>}
          </li>
        ))}
      </ul>
    </section>
  )
}
