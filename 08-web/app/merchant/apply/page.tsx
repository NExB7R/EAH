import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

async function submitApplication(formData: FormData) {
  'use server'
  const businessName = String(formData.get('business_name') || '').trim()
  const category = String(formData.get('category') || '').trim()
  const description = String(formData.get('description') || '').trim()
  if (businessName.length < 2 || category.length < 2) throw new Error('اكتب اسم النشاط ونوعه.')

  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/auth')

  const { error } = await supabase.from('merchant_applications').insert({ user_id: userData.user.id, business_name: businessName, category, description: description || null })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/merchants')
  redirect('/merchant/apply?sent=1')
}

export default async function MerchantApplyPage({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const { sent } = await searchParams
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/auth')
  const { data: applications } = await supabase.from('merchant_applications').select('id,business_name,category,status,admin_note,created_at').eq('user_id', userData.user.id).order('created_at', { ascending: false })

  return <main className="container" style={{ paddingTop: 44, maxWidth: 760 }}>
    <header className="eah-admin-header"><div><span className="eah-admin-kicker">EAH MERCHANT</span><h1>سجّل نشاطك على EAH</h1><p>قدّم بيانات المطعم أو النشاط مرة واحدة، وبعد موافقة الإدارة يتحول حسابك إلى Merchant.</p></div></header>
    {sent === '1' && <div className="card" style={{ padding: 16, marginBottom: 16 }}><strong>تم إرسال الطلب ✅</strong><p className="meta">الإدارة ستراجعه من لوحة التحكم.</p></div>}
    <form action={submitApplication} className="card" style={{ padding: 20, display: 'grid', gap: 12 }}>
      <label className="meta" htmlFor="business_name">اسم النشاط</label><input id="business_name" name="business_name" required placeholder="مثال: مطعم كذا" style={{ padding: 14, borderRadius: 14 }} />
      <label className="meta" htmlFor="category">نوع النشاط</label><input id="category" name="category" required placeholder="مطعم / كافيه / صيدلية" style={{ padding: 14, borderRadius: 14 }} />
      <label className="meta" htmlFor="description">وصف مختصر</label><textarea id="description" name="description" rows={5} placeholder="اكتب نبذة بسيطة عن النشاط" style={{ padding: 14, borderRadius: 14 }} />
      <button className="primary" type="submit">إرسال طلب صاحب نشاط ⚡</button>
    </form>
    {!!applications?.length && <div style={{ marginTop: 24 }}><h2>طلباتي</h2><div className="eah-admin-business-list">{applications.map((application) => <article key={application.id} className="eah-admin-business-card"><div><strong>{application.business_name}</strong><div className="eah-admin-business-sub">{application.category} • {application.status}</div></div>{application.admin_note && <span className="eah-admin-badge">{application.admin_note}</span>}</article>)}</div></div>}
  </main>
}
