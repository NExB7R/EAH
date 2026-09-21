import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import PartnersEditor, { type Partner } from '@/components/admin/partners-editor'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'شركاء النشاط' }

export default async function AdminPartnersPage({
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
    .from('businesses').select('id,name,slug,owner_profile_id').eq('slug', slug).maybeSingle()
  if (!biz) notFound()

  const { data: rows } = await supabase
    .from('business_partners')
    .select(`
      id, profile_id, role, status, invited_at, accepted_at, notes,
      profile:profiles!business_partners_profile_id_fkey(display_name, phone, avatar_url, avatar_key, verified_at)
    `)
    .eq('business_id', biz.id)
    .order('status')
    .order('role')

  const partners = (rows ?? []) as unknown as Partner[]

  return (
    <>
      <div className="admin-header">
        <div className="admin-header__info">
          <span className="admin-header__kicker">🪄 المصباح السحري</span>
          <h1 className="admin-header__title">شركاء {biz.name}</h1>
        </div>
        <div className="admin-header__actions">
          <Link href={`/admin/businesses/${biz.slug}/edit`} className="admin-btn admin-btn--ghost">← تعديل</Link>
          <Link href={`/businesses/${biz.slug}`} target="_blank" className="admin-btn">مشاهدة ↗</Link>
        </div>
      </div>

      <div style={{ padding: '24px 20px' }}>
        <PartnersEditor
          businessId={biz.id}
          businessName={biz.name}
          partners={partners}
          isOwner={true}
        />
      </div>
    </>
  )
}
