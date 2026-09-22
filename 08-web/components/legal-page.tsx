import Link from 'next/link'
import FloatingCapsuleHeader from './floating-capsule'
import SiteFooter from './site-footer'
import EahLogo from './eah-logo'
import './legal-page.css'

type TOCItem = { id: string; label: string }

type Props = {
  title: string
  kicker: string
  sub: string
  lastUpdate: string
  readTime: string
  toc: TOCItem[]
  children: React.ReactNode
  ctaHref?: string
  ctaText?: string
}

export default function LegalPage({
  title, kicker, sub, lastUpdate, readTime, toc,
  children,
  ctaHref = '/contact',
  ctaText = 'تواصل معنا',
}: Props) {
  return (
    <>
      <FloatingCapsuleHeader />
      <main className="lp">
        <header className="lp__hero">
          <div className="lp__hero-glow" aria-hidden />
          <div className="lp__hero-logo">
            <EahLogo size="lg" variant="full" href="/" />
          </div>
          <span className="lp__kicker">{kicker}</span>
          <h1 className="lp__title">{title}</h1>
          <p className="lp__sub">{sub}</p>
          <div className="lp__meta">
            <span className="lp__meta-item">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              آخر تحديث: {lastUpdate}
            </span>
            <span className="lp__meta-sep">·</span>
            <span className="lp__meta-item">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
              قراءة {readTime}
            </span>
          </div>
        </header>

        <div className="lp__layout">
          <aside className="lp__toc">
            <div className="lp__toc-sticky">
              <span className="lp__toc-title">محتويات الصفحة</span>
              <nav className="lp__toc-nav">
                {toc.map((t, i) => (
                  <a key={t.id} href={`#${t.id}`} className="lp__toc-item">
                    <span className="lp__toc-num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="lp__toc-label">{t.label}</span>
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <div className="lp__content">
            {children}
          </div>
        </div>

        <section className="lp__cta">
          <div className="lp__cta-inner">
            <div className="lp__cta-icon" aria-hidden>
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
            </div>
            <div className="lp__cta-text">
              <h3 className="lp__cta-title">في حاجة مش واضحة؟</h3>
              <p className="lp__cta-sub">كلّمنا وهنرد عليك في أقرب وقت</p>
            </div>
            <Link href={ctaHref} className="lp__cta-btn">
              {ctaText}
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/>
                <polyline points="12 19 5 12 12 5"/>
              </svg>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
