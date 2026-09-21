'use client'
import './business-branches-section.css'

type Branch = {
  id: string
  name: string
  area: string
  address_text: string | null
  latitude: number | null
  longitude: number | null
  phone: string | null
  whatsapp: string | null
  is_primary: boolean
}

export default function BusinessBranchesSection({
  branches,
  businessName,
}: {
  branches: Branch[]
  businessName: string
}) {
  if (!branches || branches.length === 0) return null

  return (
    <section className="bbs">
      <header className="bbs__head">
        <div>
          <span className="bbs__kicker">فروع المكان</span>
          <h2 className="bbs__title">
            {businessName} في {branches.length} {branches.length === 1 ? 'مكان' : 'أماكن'}
          </h2>
        </div>
      </header>

      <div className="bbs__grid">
        {branches.map((b) => (
          <article key={b.id} className={`bbs__card ${b.is_primary ? 'is-primary' : ''}`}>
            {b.is_primary && (
              <span className="bbs__badge">
                <span className="bbs__badge-dot" />
                الفرع الرئيسي
              </span>
            )}

            <h3 className="bbs__name">{b.name}</h3>

            <div className="bbs__info">
              <span className="bbs__info-item">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {b.area}
              </span>

              {b.address_text && (
                <span className="bbs__info-item bbs__info-item--address">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-5v-7h-4v7H5a2 2 0 0 1-2-2z"/>
                  </svg>
                  {b.address_text}
                </span>
              )}
            </div>

            <div className="bbs__actions">
              {b.phone && (
                <a href={`tel:${b.phone.replace(/\D/g, '')}`} className="bbs__btn">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.6 2z"/>
                  </svg>
                  اتصل
                </a>
              )}
              {b.whatsapp && (
                <a
                  href={`https://wa.me/${b.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`مرحباً، عايز أستفسر معاكم من EAH`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bbs__btn bbs__btn--wa"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                  </svg>
                  واتساب
                </a>
              )}
              {b.latitude != null && b.longitude != null && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${b.latitude},${b.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bbs__btn bbs__btn--map"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="1 6 8 3 16 6 23 3 23 18 16 21 8 18 1 21 1 6"/>
                    <line x1="8" y1="3" x2="8" y2="18"/>
                    <line x1="16" y1="6" x2="16" y2="21"/>
                  </svg>
                  الموقع
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
