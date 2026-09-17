'use client'
import { waLink } from '@/app/contact/contact-channels'
import './business-claim-cta.css'

export default function BusinessClaimCTA({ businessName }: { businessName?: string }) {
  const msg = businessName
    ? `السلام عليكم، أنا صاحب "${businessName}" وعايز أديره على EAH`
    : 'السلام عليكم، عندي نشاط وعايز أديره على EAH'

  return (
    <section className="claim">
      <div className="claim__inner">
        <span className="claim__badge">تجربة 30 يوم مجاناً</span>
        <div className="claim__body">
          <h3 className="claim__title">
            {businessName ? `هل "${businessName}" ده نشاطك؟` : 'هل ده نشاطك؟'}
          </h3>
          <p className="claim__text">
            خُد ملكية الصفحة، حدّث البيانات، ورد على التقييمات — كله مجاناً.
          </p>
        </div>
        <a
          href={waLink(msg)}
          target="_blank"
          rel="noreferrer"
          className="claim__btn"
        >
          كلمنا الآن
        </a>
      </div>
    </section>
  )
}
