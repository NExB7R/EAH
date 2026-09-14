import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase-server'

export const metadata = {
  title: 'صلاحيات النشاط',
}

const permissions = [['business.view','مشاهدة بيانات النشاط'],['business.edit','تعديل بيانات النشاط'],['business.publish','النشر/إخفاء الصفحة'],['media.manage','إدارة الصور والوسائط'],['offers.manage','إدارة العروض'],['reviews.manage','إدارة التقييمات'],['contacts.manage','إدارة أرقام ووسائل التواصل'],['page.manage','إدارة تصميم الصفحة']] as const

async function savePermissions(formData: FormData) {
  'use server'
  const businessId = String(formData.get('business_id') || '')
  const userId = String(formData.get('user_id') || '')
  if (!businessId || !userId) throw new Error('بيانات الصلاحيات غير مكتملة.')
  const supabase = await createClient()
  for (const [permission] of permissions) {
    const { error } = await supabase.rpc('admin_set_business_permission', { p_business_id: businessId, p_user_id: userId, p_permission: permission, p_granted: formData.get(`permission:${permission}`) === 'on' })
    if (error) throw new Error(error.message)
  }
  revalidatePath(`/admin/businesses/${String(formData.get('slug') || '')}/access`)
}

export default async function BusinessAccessPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: business, error: businessError } = await supabase.from('businesses').select('id,name,slug,owner_profile_id').eq('slug', slug).maybeSingle()
  if (businessError || !business) return <section><h1>صلاحيات النشاط</h1><p className="lead">النشاط غير موجود.</p></section>

  const [{ data: profiles }, { data: accessRows }] = await Promise.all([
    supabase.from('profiles').select('id,display_name,phone,phone_e164').order('created_at', { ascending: false }),
    supabase.from('business_access_permissions').select('user_id,permission,granted').eq('business_id', business.id),
  ])
  const owner = profiles?.find((p) => p.id === business.owner_profile_id) ?? null
  const ownerAccess = new Map((accessRows ?? []).filter((r) => r.user_id === business.owner_profile_id).map((r) => [r.permission, r.granted]))

  return <section>
    <header className="eah-admin-header"><div><span className="eah-admin-kicker">BUSINESS ACCESS</span><h1>{business.name}</h1><p>صلاحيات هذا النشاط مستقلة عن باقي الأنشطة.</p></div><a href={`/businesses/${business.slug}`} className="eah-admin-primary">مشاهدة الصفحة ↗</a></header>
    <div className="card" style={{ padding: 18, marginBottom: 20 }}><span className="meta">المالك الحالي</span><h2 style={{ margin: '8px 0 4px' }}>{owner?.display_name || 'غير محدد'}</h2><p className="lead" style={{ margin: 0 }}>{owner?.phone || owner?.phone_e164 || 'لا يوجد رقم'}</p></div>
    {owner ? <form action={savePermissions} className="card" style={{ padding: 18 }}>
      <input type="hidden" name="business_id" value={business.id} /><input type="hidden" name="user_id" value={owner.id} /><input type="hidden" name="slug" value={business.slug} />
      <h2>صلاحيات المالك لهذا النشاط</h2><p className="meta">تشغيل/إيقاف كل صلاحية هنا لا يؤثر على مطعم آخر يملكه نفس الرقم.</p>
      <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>{permissions.map(([permission, label]) => <label key={permission} className="eah-admin-command-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, cursor: 'pointer' }}><span><strong>{label}</strong><small style={{ display: 'block', marginTop: 4 }}>{permission}</small></span><input type="checkbox" name={`permission:${permission}`} defaultChecked={ownerAccess.get(permission) === true} /></label>)}</div>
      <button className="primary" type="submit" style={{ marginTop: 16 }}>حفظ صلاحيات النشاط ⚡</button>
    </form> : <div className="card" style={{ padding: 18 }}><h2>لا يوجد مالك لهذا النشاط</h2><p className="lead">اربط رقم المالك من صفحة المستخدمين أولًا.</p><a className="eah-admin-primary" href="/admin/users">اختيار رقم المالك</a></div>}
  </section>
}
