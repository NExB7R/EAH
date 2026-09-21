import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import BranchesEditor, { type Branch } from '@/components/admin/branches-editor'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'فروعي' }

export default async function BranchesMerchantPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/auth?next=/merchant/businesses/${slug}/branches`)

  const { data: biz } = await supabase
    .from('businesses').select('id,name,slug,owner_profile_id').eq('slug', slug).maybeSingle()
  if (!biz) notFound()

  const { data: roleRow } = await supabase
    .from('user_roles').select('role').eq('user_id', user.id).maybeSingle()

  const isOwner = biz.owner_profile_id === user.id
  const isAdmin = roleRow?.role === 'super_admin'
  if (!isOwner && !isAdmin) redirect('/merchant')

  const { data: branches } = await supabase
    .from('business_branches')
    .select('*')
    .eq('business_id', biz.id)
    .order('is_primary', { ascending: false })
    .order('sort_order')

  return (
    <>
      <div className="admin-header">
        <div className="admin-header__info">
          <span className="admin-header__kicker">فروعي</span>
          <h1 className="admin-header__title">فروع {biz.name}</h1>
          <p className="admin-header__subtitle">إدارة فروع النشاط بتاعك</p>
        </div>
        <div className="admin-header__actions">
          <Link href="/merchant" className="admin-btn admin-btn--ghost">
            ← لوحة النشاط
          </Link>
        </div>
      </div>

      <div style={{ padding: '24px 20px' }}>
        <BranchesEditor businessId={biz.id} branches={(branches ?? []) as Branch[]} />
      </div>
    </>
  )
}
