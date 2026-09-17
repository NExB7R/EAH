import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import FeaturesClient from './FeaturesClient'
import './features.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'ميزات النشاط' }

export default async function BusinessFeaturesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) redirect('/admin/login')
  const { data: role } = await supabase.from('user_roles').select('role').eq('user_id', user.user.id).maybeSingle()
  if (role?.role !== 'super_admin') redirect('/')

  const { data: biz } = await supabase
    .from('businesses')
    .select('id,name,slug')
    .eq('slug', slug)
    .maybeSingle()
  if (!biz) notFound()

  const { data: features } = await supabase
    .from('business_features')
    .select('feature_key,enabled,expires_at,notes')
    .eq('business_id', biz.id)

  return (
    <main className="bf">
      <header className="bf__hero">
        <Link href={`/admin/businesses/${slug}`} className="bf__back">← النشاط</Link>
        <span className="bf__kicker">إدارة الميزات المدفوعة</span>
        <h1 className="bf__title">🎛 ميزات {biz.name}</h1>
        <p className="bf__sub">كل ميزة لها مفتاح مستقل — تقدر تشغّلها أو توقفها وقت ما تحب</p>
      </header>
      <FeaturesClient
        businessId={biz.id}
        businessSlug={slug}
        initialFeatures={(features ?? []) as any}
      />
    </main>
  )
}
