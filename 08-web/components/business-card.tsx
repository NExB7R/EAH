import Link from 'next/link'
type BusinessCardInput = { name: string; slug: string; type?: string; area?: string; badge?: string; hook?: string }

export default function BusinessCard({ business }: { business: BusinessCardInput }) {
  return <article className="card business-card">
    <Link href={`/businesses/${business.slug}`} aria-label={`فتح ${business.name}`}>
    </Link>
    <div className="card-body">
      <div className="card-row"><Link className="card-title" href={`/businesses/${business.slug}`}>{business.name}</Link>{business.badge && <span className="badge">{business.badge}</span>}</div>
      <div className="meta">{business.area} · {business.open ? 'مفتوح دلوقتي' : 'مغلق'}</div>
      <div className="vibes">{business.vibe.map(tag => <span key={tag} className="vibe">{tag}</span>)}</div>
      <div className="why"><span>✨</span>{business.reason}</div>
    </div>
  </article>
}
