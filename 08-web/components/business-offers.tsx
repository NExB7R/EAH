'use client'
import './business-offers.css'

type Offer = {
  id: string
  title: string
  description: string | null
  price: number | null
  teaser_image_path: string | null
  starts_at: string | null
  ends_at: string | null
}

export default function BusinessOffers({ offers }: { offers: Offer[] }) {
  if (offers.length === 0) return null

  return (
    <section className="boff">
      <div className="boff__header">
        <h2 className="boff__title">
          <span>🔥</span> العروض النشطة
        </h2>
        <span className="boff__count">{offers.length}</span>
      </div>

      <div className="boff__grid">
        {offers.map((o) => {
          const daysLeft = o.ends_at
            ? Math.max(0, Math.ceil((new Date(o.ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
            : null

          return (
            <div key={o.id} className="boff__card">
              <div className="boff__card-glow" aria-hidden />
              <div className="boff__card-body">
                <h3 className="boff__card-title">{o.title}</h3>
                {o.description && (
                  <p className="boff__card-desc">{o.description}</p>
                )}
                <div className="boff__card-foot">
                  {o.price !== null && (
                    <span className="boff__price">{o.price} ج.م</span>
                  )}
                  {daysLeft !== null && daysLeft > 0 && (
                    <span className="boff__timer">
                      ⏱ باقي {daysLeft} يوم
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
