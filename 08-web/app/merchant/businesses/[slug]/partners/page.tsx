import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import PartnersClient from './PartnersClient'
import './partners.css'
import { IcUsers } from '@/components/eah-icons'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'شركاء النشاط' }

export default async function PartnersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) redirect('/auth?next=/merchant')

  const { data: biz } = await supabase
    .from('businesses')
    .select('id,name,slug,owner_profile_id')
    .eq('slug', slug)
    .maybeSingle()
  if (!biz) notFound()

  const isOwner = biz.owner_profile_id === user.user.id
  const { data: role } = await supabase.from('user_roles').select('role').eq('user_id', user.user.id).maybeSingle()
  const isAdmin = role?.role === 'super_admin'
  if (!isOwner && !isAdmin) redirect('/merchant')

  const { data: partners } = await supabase
    .from('business_partners')
    .select('id,profile_id,role,created_at, profile:profiles(display_name,phone,avatar_url)')
    .eq('business_id', biz.id)

  return (
    <main className="ptn">
      <header className="ptn__hero">
        <Link href={`/merchant/businesses/${slug}`} className="ptn__back">← رجوع للنشاط</Link>
        <span className="ptn__kicker">إدارة الشركاء</span>
        <h1 className="ptn__title"><IcUsers /> شركاء {biz.name}</h1>
        <p className="ptn__sub">أضف مسئول أو انقل الملكية — كل حاجة موثقة</p>
      </header>

      <PartnersClient
        businessId={biz.id}
        businessSlug={slug}
        partners={(partners ?? []) as any}
      />
    </main>
  )
}
