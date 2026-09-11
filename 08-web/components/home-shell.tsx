'use client'

import Link from 'next/link'
import BusinessCard from '@/components/business-card'
import InstallPrompt from '@/components/install-prompt'
import NotificationOptIn from '@/components/notification-optin'
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
    <header className="topbar"><div className="container topbar-inner">
      <Link className="brand" href="/" aria-label="EAH الرئيسية"><span className="brand-mark">E</span><span className="brand-word">EAH</span></Link>
      <div className="actions"><Link className="pill" href="/auth">دخول</Link></div>
    </div></header>

    <main className="container">
      <InstallPrompt />
      <NotificationOptIn />
      <section className="hero">
        <div className="eyebrow">شبين القناطر وما حواليها</div>
        <div className="hero-row"><div><h1>إيه محتاج؟</h1><p>اكتشف مكان مناسب ليك. وكل ما تستخدم EAH، الترشيحات تظبط أكتر على ذوقك.</p></div><div className="hero-bubble">يتعلم<br/>من ذوقك</div></div>
        <div className="search" role="search"><input aria-label="ابحث عن مطعم أو خدمة" placeholder="دور على مطعم، صيدلية، سوبر ماركت..."/><button className="primary">ابحث</button></div>
        <div className="intent-row"><Link className="intent-chip active" href="/explore?intent=food">🍔 أكل</Link><Link className="intent-chip" href="/explore?intent=pharmacy">💊 صيدلية</Link><Link className="intent-chip" href="/explore?intent=groceries">🛒 مقاضي</Link><Link className="intent-chip" href="/explore?intent=delivery">📦 توصيل</Link></div>
        <Link className="recommend-card" href="/recommend"><div><span className="eyebrow">مش عارف تختار؟</span><h3>رشّحلي</h3><p>قولّي ميزانيتك ومزاجك وأنا أطلعلك كام اختيار مناسب.</p></div><span className="arrow">←</span></Link>
      </section>

      <section className="section"><div className="section-head"><div><h2>على ذوقك</h2><span>ترشيحات ليك مش للكل</span></div><Link href="/explore">شوف الكل ←</Link></div><div className="grid">{businesses.slice(0, 4).map(b => <BusinessCard business={b} key={b.slug}/>)}</div></section>

      <section className="section"><div className="section-head"><div><h2>ترند دلوقتي</h2><span>حاجات الناس بتتفاعل معاها</span></div></div><div className="trend-grid">{trending.map(x => <article className="trend-card" key={x.title}><span className="badge">{x.vibe}</span><h3>{x.title}</h3><p>{x.meta}</p><span className="trend-link">شوف ليه الناس بتتكلم عنه →</span></article>)}</div></section>
    </main>
    <nav className="bottomnav" aria-label="التنقل الرئيسي"><Link className="navitem active" href="/">الرئيسية</Link><Link className="navitem" href="/explore">اكتشف</Link><Link className="navitem" href="/explore?mode=favorites">مفضلاتك</Link><Link className="navitem" href="/auth">حسابك</Link></nav>
  </div>
}
