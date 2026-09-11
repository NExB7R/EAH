'use client'

import { useState } from 'react'
import Link from 'next/link'
import BusinessCard from '@/components/business-card'
import { demoBusinesses } from '@/lib/demo-data'

export default function RecommendPage() {
  const [budget, setBudget] = useState('متوسط')
  const [mood, setMood] = useState('عايز حاجة مريحة')
  const [result, setResult] = useState(false)
  return <main className="container page-pad">
    <Link className="pill" href="/">← الرئيسية</Link>
    <div className="eyebrow" style={{marginTop:24}}>اختيارات على مقاسك</div>
    <h1 className="page-title">رشّحلي</h1>
    <p className="lead">بدل ما تلف كتير، جاوب على كام حاجة وإحنا نرتبلك الأنسب.</p>
    <section className="quiz-card">
      <div><h2>الميزانية؟</h2><div className="choice-row">{['اقتصادي','متوسط','مفتوح'].map(x => <button className={`choice ${budget === x ? 'selected' : ''}`} key={x} onClick={() => setBudget(x)}>{x}</button>)}</div></div>
      <div><h2>مزاجك إيه؟</h2><div className="choice-row">{['عايز حاجة مريحة','عايز أجرب جديد','عايز حاجة سريعة'].map(x => <button className={`choice ${mood === x ? 'selected' : ''}`} key={x} onClick={() => setMood(x)}>{x}</button>)}</div></div>
      <button className="primary full" onClick={() => setResult(true)}>ورّيني الترشيحات</button>
    </section>
    {result && <section className="section"><div className="section-head"><div><h2>رشحنا لك 3 حاجات</h2><span>{budget} · {mood}</span></div></div><div className="grid">{demoBusinesses.filter(b => b.type === 'restaurant').map(b => <BusinessCard key={b.slug} business={b}/>)}<article className="card"><div className="card-body"><h3>محتاج تنويع؟</h3><p className="meta">جرّب اختيار خارج عاداتك المفضلة 10% بس. كده نكتشف ذوقك بدل ما نفضل في نفس الدايرة.</p></div></article></div></section>}
  </main>
}
