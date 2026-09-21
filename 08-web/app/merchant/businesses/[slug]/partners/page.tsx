import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import PartnersEditor, { type Partner } from '@/components/admin/partners-editor'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'شركاء النشاط' }

export default async function MerchantPartnersPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/auth?next=/merchant/businesses/${slug}/partners`)

  const { data: biz } = await supabase
    .from('businesses')
    .select('id,name,slug,owner_profile_id')
    .eq('slug', slug)
    .maybeSingle()
  if (!biz) notFound()

  const { data: roleRow } = await supabase
    .from('user_roles').select('role').eq('user_id', user.id).maybeSingle()

  const isOwner = biz.owner_profile_id === user.id
  const isAdmin = roleRow?.role === 'super_admin'

  // شوف لو شريك نشط
  const { data: partnerRow } = await supabase
    .from('business_partners')
    .select('role, status')
    .eq('business_id', biz.id)
    .eq('profile_id', user.id)
    .maybeSingle()

  const isActivePartner = partnerRow?.status === 'accepted'
  const canView = isOwner || isAdmin || isActivePartner

  if (!canView) redirect('/merchant')

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
          <p className="admin-header__subtitle">أدِر فريقك بالكامل</p>
        </div>
        <div className="admin-header__actions">
          <Link href="/merchant" className="admin-btn admin-btn--ghost">← لوحة النشاط</Link>
        </div>
      </div>

      <div style={{ padding: '24px 20px' }}>
        <PartnersEditor
          businessId={biz.id}
          businessName={biz.name}
          partners={partners}
          isOwner={isOwner || isAdmin}
        />
      </div>
    </>
  )
}
