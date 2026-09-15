import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import MenuEditor from './MenuEditor'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'إدارة المنيو' }

export default async function MenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/auth?next=/merchant')

  const { data: biz } = await supabase
    .from('businesses')
    .select('id,name,slug,owner_profile_id,business_type')
    .eq('slug', slug)
    .maybeSingle()

  if (!biz) notFound()

  const { data: role } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userData.user.id)
    .maybeSingle()

  const isOwner = biz.owner_profile_id === userData.user.id
  const isAdmin = role?.role === 'super_admin'
  if (!isOwner && !isAdmin) notFound()

  const { data: items } = await supabase
    .from('business_menu_items')
    .select('*')
    .eq('business_id', biz.id)
    .order('category', { ascending: true })
    .order('sort_order', { ascending: true })

  return (
    <>
      <FloatingCapsuleHeader />
      <main className="mm">
        <header className="mm__head">
          <Link href="/merchant" className="mm__back">← لوحة النشاط</Link>
          <div>
            <span className="mm__kicker">MENU MANAGEMENT</span>
            <h1 className="mm__title">📋 منيو {biz.name}</h1>
            <p className="mm__sub">
              ضيف الأصناف بالفئات والأسعار — تظهر للعملاء في صفحة النشاط
            </p>
          </div>
        </header>

        <MenuEditor businessId={biz.id} initialItems={(items ?? []) as any[]} />
      </main>
      <SiteFooter />
    </>
  )
}
