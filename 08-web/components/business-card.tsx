type BusinessCardInput = {
  name: string
  slug: string
  type?: string
  area?: string
  badge?: string
  hook?: string
  open?: boolean
  vibe?: string[]
  reason?: string
  featured?: boolean
  activeOffers?: number
}

export default function BusinessCard({ business }: { business: BusinessCardInput }) {
  return (
    <article className="bcard">
      <div className="bcard__head">
        <h3 className="bcard__name">{business.name}</h3>
        {business.badge && <span className="bcard__badge">{business.badge}</span>}
      </div>
      {business.area && <span className="bcard__area">📍 {business.area}</span>}
      {business.hook && <p className="bcard__hook">✨ {business.hook}</p>}
      {business.vibe && business.vibe.length > 0 && (
        <div className="bcard__vibes">
          {business.vibe.map((tag: string) => (
            <span key={tag} className="bcard__vibe">{tag}</span>
          ))}
        </div>
      )}
      {business.reason && <p className="bcard__reason">{business.reason}</p>}
    </article>
  )
}
