import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import BranchesEditor, { type Branch } from '@/components/admin/branches-editor'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'فروع النشاط' }

export default async function BranchesAdminPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: roleRow } = await supabase
    .from('user_roles').select('role').eq('user_id', user.id).maybeSingle()
  if (roleRow?.role !== 'super_admin') redirect('/')

  const { data: biz } = await supabase
    .from('businesses').select('id,name,slug').eq('slug', slug).maybeSingle()
  if (!biz) notFound()

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
          <span className="admin-header__kicker">إدارة الفروع</span>
          <h1 className="admin-header__title">فروع {biz.name}</h1>
          <p className="admin-header__subtitle">ضيف فروع تانية لنفس النشاط</p>
        </div>
        <div className="admin-header__actions">
          <Link href={`/admin/businesses/${biz.slug}/edit`} className="admin-btn admin-btn--ghost">
            ← تعديل النشاط
          </Link>
          <Link href={`/businesses/${biz.slug}`} target="_blank" className="admin-btn">
            مشاهدة ↗
          </Link>
        </div>
      </div>

      <div style={{ padding: '24px 20px' }}>
        <BranchesEditor businessId={biz.id} branches={(branches ?? []) as Branch[]} />
      </div>
    </>
  )
}
