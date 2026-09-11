import Link from 'next/link'
import BusinessCard from '@/components/business-card'
import { getPublishedBusinesses } from '@/lib/data'

const intentMap: Record<string,string> = { food:'restaurant', pharmacy:'pharmacy', groceries:'supermarket', delivery:'delivery_office' }

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ intent?: string }> }) {
  const params = await searchParams
  const intent = params.intent ? intentMap[params.intent] ?? params.intent : undefined
  const businesses = await getPublishedBusinesses(20, intent)
  return <main className="container page-pad"><Link className="pill" href="/">← الرئيسية</Link><div className="eyebrow" style={{marginTop:24}}>اكتشف</div><h1 className="page-title">{intent ? 'اختيارات مناسبة لطلبك' : 'كل اللي حواليك'}</h1><p className="lead">الداتا جاية من EAH مباشرة: ترتيب حسب الصلة، التفاعل، التميز، ونوع النشاط.</p>{businesses.length ? <div className="grid">{businesses.map(b => <BusinessCard key={b.slug} business={b}/>)}</div> : <div className="soft-banner"><div><strong>لسه بنبني الدليل هنا 👀</strong><span>أول ما نسجل الأنشطة في EAH هتظهر تلقائيًا هنا.</span></div><Link className="primary" href="/auth">سجّل</Link></div>}</main>
}
