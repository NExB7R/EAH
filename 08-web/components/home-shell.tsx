import Link from 'next/link'
import BusinessCard from '@/components/business-card'
import InstallPrompt from '@/components/install-prompt'
import NotificationOptIn from '@/components/notification-optin'
import SmartHeader from '@/components/smart-header'
import { getPublishedBusinesses } from '@/lib/data'

const trending = [
  { title: 'كومبو الغدا', meta: '🔥 الناس بتتفاعل معاه', vibe: 'مزاج الغدا' },
  { title: 'وجبة فردي', meta: '⚡ اختيار سريع', vibe: 'سريع' },
  { title: 'منيو جديد', meta: '👀 لسه نازل', vibe: 'جديد' },
  { title: 'عرض العيلة', meta: '❤️ مناسب للبيت', vibe: 'لمة' },
]

export default async function HomeShell() {
  const businesses = await getPublishedBusinesses(8)
  return <div className="shell">
    <SmartHeader />

    <main className="container">
      <section className="hero">
        <span className="hero-logo" aria-label="EAH">EAH<span className="brand-bang" aria-hidden="true">!</span></span>
        <div className="eyebrow">شبين القناطر وما حواليها</div>
        <h1>اللي نفسك فيه ؟</h1>
        <p>اكتشف مكان مناسب ليك. وكل ما تستخدم EAH، الترشيحات تظبط أكتر على ذوقك.</p>
        <div className="search" role="search"><input aria-label="ابحث عن مطعم أو خدمة" placeholder="دور على مطعم، صيدلية، سوبر ماركت..."/><button className="primary">ابحث</button></div>
        <div className="intent-row"><Link className="intent-chip active" href="/explore?intent=food">🍔 أكل</Link><Link className="intent-chip" href="/explore?intent=pharmacy">💊 صيدلية</Link><Link className="intent-chip" href="/explore?intent=groceries">🛒 مقاضي</Link><Link className="intent-chip" href="/explore?intent=delivery">📦 توصيل</Link></div>
        <Link className="recommend-card" href="/recommend"><div><span className="eyebrow">مش عارف تختار؟</span><h3>رشّحلي</h3><p>قولّي ميزانيتك ومزاجك وأنا أطلعلك كام اختيار مناسب.</p></div><span className="arrow">←</span></Link>
      </section>

      <InstallPrompt />
      <NotificationOptIn />

      <section className="section"><div className="section-head"><div><h2>على ذوقك</h2><span>ترشيحات ليك مش للكل</span></div><Link href="/explore">شوف الكل ←</Link></div><div className="grid">{businesses.slice(0, 4).map(b => <BusinessCard business={b} key={b.slug}/>)}</div></section>

      <section className="section"><div className="section-head"><div><h2>ترند دلوقتي</h2><span>حاجات الناس بتتفاعل معاها</span></div></div><div className="trend-grid">{trending.map(x => <article className="trend-card" key={x.title}><span className="badge">{x.vibe}</span><h3>{x.title}</h3><p>{x.meta}</p><span className="trend-link">شوف ليه الناس بتتكلم عنه →</span></article>)}</div></section>

      <footer className="site-foot"><span id="about">عن EAH</span><span id="contact">تواصل معنا</span><span id="terms">الشروط</span><span id="privacy">الخصوصية</span><span>© EAH</span></footer>
    </main>

    <Link className="quick-cta" href="/auth">سجّل بسرعة <span aria-hidden="true">⚡</span></Link>

    <nav className="bottomnav" aria-label="التنقل الرئيسي"><Link className="navitem active" href="/">الرئيسية</Link><Link className="navitem" href="/explore">اكتشف</Link><Link className="navitem" href="/explore?mode=favorites">مفضلاتك</Link><Link className="navitem" href="/auth">حسابك</Link></nav>
  </div>
}
