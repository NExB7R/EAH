import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase-server'

type Profile = { id: string; display_name: string | null; phone: string | null; phone_e164: string | null }
type Business = { id: string; name: string; slug: string; owner_profile_id: string | null }

async function assignBusiness(formData: FormData) {
  'use server'
  const businessId = String(formData.get('business_id') || '')
  const userId = String(formData.get('user_id') || '')
  if (!businessId || !userId) throw new Error('اختار النشاط ورقم المستخدم.')

  const supabase = await createClient()
  const { error } = await supabase.rpc('admin_set_business_owner', { p_business_id: businessId, p_user_id: userId })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/users')
  revalidatePath('/admin/businesses')
}

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const [{ data: profiles, error: profilesError }, { data: roles, error: rolesError }, { data: businesses, error: businessesError }] = await Promise.all([
    supabase.from('profiles').select('id,display_name,phone,phone_e164').order('created_at', { ascending: false }).limit(500),
    supabase.from('user_roles').select('user_id,role'),
    supabase.from('businesses').select('id,name,slug,owner_profile_id').order('updated_at', { ascending: false }).limit(500),
  ])

  if (profilesError || rolesError || businessesError) return <section><h1>المستخدمين</h1><p className="lead">تعذر تحميل إدارة الحسابات.</p></section>

  const roleByUser = new Map((roles ?? []).map((row) => [row.user_id, row.role]))
  const ownerByBusiness = new Map((businesses ?? []).filter((b) => b.owner_profile_id).map((b) => [b.owner_profile_id as string, b]))
  const rows = (profiles ?? []) as Profile[]
  const businessRows = (businesses ?? []) as Business[]

  return (
    <section>
      <header className="eah-admin-header">
        <div><span className="eah-admin-kicker">IDENTITY CONTROL</span><h1>المستخدمين والحسابات</h1><p>اختار رقم من حسابات EAH واربطه مباشرة بأي نشاط. كل نشاط يحتفظ بصلاحياته بشكل مستقل.</p></div>
      </header>

      <div className="card" style={{ padding: 18, marginBottom: 20 }}>
        <h2>ربط رقم بمالك نشاط</h2>
        <p className="meta">بعد الربط يتحول الحساب إلى Merchant إذا لم يكن Admin، وتُنشأ له صلاحيات النشاط الأساسية.</p>
        <form action={assignBusiness} style={{ display: 'grid', gap: 12, marginTop: 14 }}>
          <label className="meta" htmlFor="user_id">رقم/حساب المالك</label>
          <select id="user_id" name="user_id" required style={{ width: '100%', padding: 14, borderRadius: 14 }}><option value="">اختار المستخدم</option>{rows.map((user) => <option key={user.id} value={user.id}>{user.display_name || 'بدون اسم'} — {user.phone || user.phone_e164 || 'بدون رقم'} — {roleByUser.get(user.id) || 'customer'}</option>)}</select>
          <label className="meta" htmlFor="business_id">النشاط</label>
          <select id="business_id" name="business_id" required style={{ width: '100%', padding: 14, borderRadius: 14 }}><option value="">اختار المطعم/النشاط</option>{businessRows.map((business) => <option key={business.id} value={business.id}>{business.name} — /businesses/{business.slug}</option>)}</select>
          <button className="primary" type="submit">ربط الحساب بالنشاط ⚡</button>
        </form>
      </div>

      <div className="eah-admin-stat-grid">
        <div className="eah-admin-stat-card"><span>إجمالي الحسابات</span><strong>{rows.length}</strong></div>
        <div className="eah-admin-stat-card"><span>Merchants</span><strong>{rows.filter((r) => roleByUser.get(r.id) === 'merchant').length}</strong></div>
        <div className="eah-admin-stat-card"><span>أنشطة لها مالك</span><strong>{businessRows.filter((b) => b.owner_profile_id).length}</strong></div>
      </div>

      <div className="eah-admin-business-list" style={{ marginTop: 20 }}>
        {rows.map((user) => {
          const ownerBusiness = ownerByBusiness.get(user.id)
          const role = roleByUser.get(user.id) || 'customer'
          return <article key={user.id} className="eah-admin-business-card"><div><div className="eah-admin-business-meta"><span className="eah-admin-business-name">{user.display_name || 'بدون اسم'}</span><span className="eah-admin-badge">{role}</span></div><div className="eah-admin-business-sub">{user.phone || user.phone_e164 || 'رقم غير مسجل'}{ownerBusiness ? ` • مالك: ${ownerBusiness.name}` : ''}</div></div><div className="eah-admin-actions">{ownerBusiness ? <a className="eah-admin-btn primary" href={`/admin/businesses/${ownerBusiness.slug}/access`}>صلاحيات النشاط</a> : <span className="eah-admin-badge">لا يوجد نشاط مربوط</span>}</div></article>
        })}
      </div>
    </section>
  )
}
