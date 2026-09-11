import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase-server'

export default async function MerchantBusinessEditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user
  if (!user) redirect('/auth')

  const { data: business } = await supabase
    .from('businesses')
    .select('id,name,slug,description,address_text,city,area,is_open,is_published,owner_profile_id')
    .eq('slug', slug)
    .eq('owner_profile_id', user.id)
    .maybeSingle()

  if (!business) redirect('/merchant')

  async function submitChange(formData: FormData) {
    'use server'
    const client = await createClient()
    const { data: authData } = await client.auth.getUser()
    const currentUser = authData.user
    if (!currentUser) redirect('/auth')

    const payload = {
      name: String(formData.get('name') ?? '').trim(),
      description: String(formData.get('description') ?? '').trim() || null,
      address_text: String(formData.get('address_text') ?? '').trim() || null,
      city: String(formData.get('city') ?? '').trim() || null,
      area: String(formData.get('area') ?? '').trim() || null,
      is_open: formData.get('is_open') === 'on',
    }

    if (!payload.name) throw new Error('اسم النشاط مطلوب.')

    const { error } = await client.rpc('submit_business_change_request', {
      p_business_id: business.id,
      p_entity_type: 'business',
      p_operation: 'update',
      p_target_id: business.id,
      p_payload: payload,
    })

    if (error) throw new Error(error.message)

    revalidatePath(`/merchant/businesses/${business.slug}/edit`)
    revalidatePath('/merchant')
    redirect(`/merchant?submitted=1&business=${encodeURIComponent(business.slug)}`)
  }

  return (
    <main className="container" style={{ paddingTop: 44, paddingBottom: 60 }}>
      <header className="eah-admin-header">
        <div>
          <span className="eah-admin-kicker">EAH MERCHANT • REVIEW REQUIRED</span>
          <h1>تعديل بيانات النشاط</h1>
          <p>التعديل لا يظهر للناس فورًا. بيتحول لمراجعة أدمن، والنشر يحصل فقط بعد الموافقة.</p>
        </div>
        <a href="/merchant" className="eah-admin-btn">← لوحة النشاط</a>
      </header>

      <div className="card" style={{ maxWidth: 760, padding: 24 }}>
        <form action={submitChange} style={{ display: 'grid', gap: 14 }}>
          <label>اسم النشاط<input name="name" defaultValue={business.name} required /></label>
          <label>الوصف<textarea name="description" defaultValue={business.description ?? ''} rows={5} /></label>
          <label>العنوان<input name="address_text" defaultValue={business.address_text ?? ''} /></label>
          <label>المدينة<input name="city" defaultValue={business.city ?? ''} /></label>
          <label>المنطقة<input name="area" defaultValue={business.area ?? ''} /></label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}><input type="checkbox" name="is_open" defaultChecked={business.is_open} /> النشاط مفتوح</label>
          <div style={{ padding: '12px 14px', borderRadius: 14, background: 'rgba(168,85,247,.10)', border: '1px solid rgba(168,85,247,.20)' }}>
            <strong>مراجعة قبل النشر</strong>
            <div style={{ opacity: .78, marginTop: 5 }}>حتى لو التعديل بسيط، مش هيتكتب على الصفحة المنشورة إلا بعد اعتمادك من لوحة الإدارة.</div>
          </div>
          <button className="eah-admin-btn primary" type="submit">إرسال للمراجعة</button>
        </form>
      </div>
    </main>
  )
}
