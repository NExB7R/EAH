import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireMerchantForBusiness } from '@/lib/admin/merchant-guard'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import BusinessForm from '@/components/admin/business-form'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'تعديل بيانات النشاط' }

export default async function MerchantEditBusinessPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { business, supabase, user } = await requireMerchantForBusiness(slug)

  const [contactsRes, mediaRes] = await Promise.all([
    supabase.from('business_contact_methods').select('method_type,value,is_primary').eq('business_id', business.id),
    supabase.from('business_media').select('media_type,storage_path,sort_order').eq('business_id', business.id).eq('is_published', true).order('sort_order'),
  ])

  const { data: biz } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', business.id)
    .maybeSingle()

  if (!biz) redirect('/merchant')

  const contacts = (contactsRes.data ?? []).map((c) => ({
    method_type: c.method_type as any,
    value: c.value,
    is_primary: c.is_primary ?? false,
  }))

  const gallery = (mediaRes.data ?? []).filter((m) => m.media_type === 'gallery').map((m) => m.storage_path)
  const menu = (mediaRes.data ?? []).filter((m) => m.media_type === 'menu').map((m) => m.storage_path)

  // Server Action يروح لطلب تعديل (change request) بدل التعديل المباشر
  const submitChangeRequest = async (
    prev: { ok: boolean; message?: string; errors?: Record<string, string[]> },
    formData: FormData
  ) => {
    'use server'
    const sb = await import('@/lib/supabase-server').then((m) => m.createClient())
    const { data: u } = await sb.auth.getUser()
    if (!u.user) return { ok: false, message: 'غير مصرح' }

    const payload: Record<string, unknown> = {}
    for (const [k, v] of formData.entries()) {
      if (k === 'contacts_json' || k === 'gallery_json' || k === 'menu_json' || k === 'working_hours_json') continue
      if (typeof v === 'string') payload[k] = v
    }

    const { data: pending, error } = await sb.rpc('submit_pending_change', {
      p_action: 'business.update',
      p_entity_type: 'business',
      p_entity_id: business.id,
      p_payload: payload,
    })

    if (error) return { ok: false, message: error.message }
    const r = pending as any
    if (!r?.ok) return { ok: false, message: r?.reason ?? 'failed' }

    // notify admins
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/api/admin/pending/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pendingId: r.id }),
      })
    } catch { /* silent */ }

    redirect('/merchant/pending?submitted=1')
  }

  return (
    <>
      <FloatingCapsuleHeader />
      <main className="mpage">
        <div className="mpage__head">
          <div>
            <span className="mpage__kicker">مراجعة مطلوبة</span>
            <h1 className="mpage__title"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline',verticalAlign:'middle',marginLeft:4}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> تعديل: {business.name}</h1>
            <p className="mpage__sub">
              التعديلات لا تُنشر فورًا — بتروح لمراجعة الأدمن أول
            </p>
          </div>
          <Link href="/merchant" className="admin-btn admin-btn--ghost">← رجوع</Link>
        </div>

        <div style={{ maxWidth: 900, margin: '0 auto 16px', padding: '0 20px', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <a href={`/merchant/businesses/${biz.slug}/branches`} className="admin-btn">إدارة الفروع</a>
        <a href={`/merchant/businesses/${biz.slug}/partners`} className="admin-btn">الشركاء 🪄</a>
      </div>
      <BusinessForm
          mode="edit"
          action={submitChangeRequest}
          businessId={business.id}
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
      </main>
    </>
  )
}
