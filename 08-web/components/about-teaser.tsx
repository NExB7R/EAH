import Link from 'next/link'
import './about-teaser.css'

export default function AboutTeaser() {
  return (
    <section className="at" aria-label="عن EAH">
      <div className="at__inner">
        <div className="at__content">
          <span className="at__kicker">احنا مين؟</span>
          <h2 className="at__title">
            منصة محلية،
            <br />
            <span className="at__title-accent">بتتكلم لغتك</span>
          </h2>
          <p className="at__body">
            EAH بدأت من شبين القناطر — عشان نوصّل الناس بأماكنهم المفضلة،
            ونخلي كل صاحب نشاط صغير يبان. بدون وسيط، بدون تعقيد.
          </p>
          <div className="at__stats">
            <div className="at__stat">
              <strong>100%</strong>
              <small>مجاني للعميل</small>
            </div>
            <div className="at__stat">
              <strong>24/7</strong>
              <small>دعم مباشر</small>
            </div>
            <div className="at__stat">
              <strong>محلي</strong>
              <small>من قلب البلد</small>
            </div>
          </div>
          <Link href="/about" className="at__cta">
            اعرف أكتر
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
