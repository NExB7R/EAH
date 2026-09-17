import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import BusinessForm from '@/components/admin/business-form'
import CommissionControl from '@/components/admin/commission-control'
import { updateBusiness } from '../../actions'

export const metadata = { title: 'تعديل مكان' }

export default async function EditBusinessPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/admin/login')

  const { data: roleRow } = await supabase
    .from('user_roles').select('role').eq('user_id', userData.user.id).maybeSingle()
  if (roleRow?.role !== 'super_admin') redirect('/')

  const { data: biz } = await supabase
    .from('businesses').select('*').eq('slug', slug).maybeSingle()
  if (!biz) notFound()

  const [contactsRes, mediaRes] = await Promise.all([
    supabase.from('business_contact_methods').select('method_type,value,is_primary').eq('business_id', biz.id),
    supabase.from('business_media').select('media_type,storage_path,sort_order').eq('business_id', biz.id).eq('is_published', true).order('sort_order'),
  ])

  const contacts = (contactsRes.data ?? []).map((c) => ({
    method_type: c.method_type as any,
    value: c.value,
    is_primary: c.is_primary ?? false,
  }))

  const gallery = (mediaRes.data ?? []).filter((m) => m.media_type === 'gallery').map((m) => m.storage_path)
  const menu = (mediaRes.data ?? []).filter((m) => m.media_type === 'menu').map((m) => m.storage_path)

  const actionWithId = async (
    prev: { ok: boolean; message?: string; errors?: Record<string, string[]> },
    formData: FormData
  ) => {
    'use server'
    return updateBusiness(biz.id, prev, formData)
  }

  return (
    <>
      <div className="admin-header">
        <div className="admin-header__info">
          <span className="admin-header__kicker">تعديل النشاط</span>
          <h1 className="admin-header__title"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline',verticalAlign:'middle',marginLeft:4}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> تعديل: {biz.name}</h1>
          <p className="admin-header__subtitle">/businesses/{biz.slug}</p>
        </div>
        <div className="admin-header__actions">
          <Link href="/admin/businesses" className="admin-btn admin-btn--ghost">← رجوع</Link>
          <Link href={`/businesses/${biz.slug}`} target="_blank" className="admin-btn">مشاهدة ↗</Link>
          <Link href={`/admin/businesses/${biz.slug}/offers`} className="admin-btn admin-btn--gold">العروض</Link>
        </div>
      </div>

      <BusinessForm
        mode="edit"
        action={actionWithId}
        businessId={biz.id}
        initial={{
          name: biz.name,
          slug: biz.slug,
          business_type: biz.business_type,
          area: biz.area ?? '',
          city: biz.city ?? 'شبين القناطر',
          description: biz.description ?? '',
          hook: biz.hook ?? '',
          address_text: biz.address_text ?? '',
          map_url: biz.map_url ?? null,
          cover_image_url: biz.cover_image_url ?? null,
          working_hours: biz.working_hours ?? {},
          contacts,
          gallery,
          menu,
          is_open: biz.is_open,
          is_featured: biz.is_featured,
          is_published: biz.is_published,
        }}
      />
        <CommissionControl businessId={biz.id} />
    </>
  )
}
