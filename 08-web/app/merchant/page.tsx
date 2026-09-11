import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

export default async function MerchantDashboard() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user
  if (!user) redirect('/auth')

  const { data: roleRow } = await supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle()
  if (roleRow?.role !== 'merchant' && roleRow?.role !== 'admin' && roleRow?.role !== 'super_admin') redirect('/?merchant=denied')

  const { data: businesses } = await supabase
    .from('businesses')
    .select('id,name,slug,description,city,area,is_open,is_published,is_featured,owner_profile_id')
    .eq('owner_profile_id', user.id)
    .order('updated_at', { ascending: false })

  return (
    <main className="container" style={{ paddingTop: 44 }}>
      <header className="eah-admin-header">
        <div><span className="eah-admin-kicker">EAH MERCHANT</span><h1>إدارة نشاطك</h1><p>كل مطعم أو نشاط مربوط برقمك يظهر هنا بصلاحياته الخاصة.</p></div>
        <a href="/" className="eah-admin-btn">← الموقع</a>
      </header>

      {(businesses ?? []).length === 0 ? (
        <div className="card" style={{ padding: 20 }}><h2>لسه مفيش نشاط مربوط بالحساب</h2><p className="lead">الأدمن يقدر يربط رقمك بأي مطعم من لوحة التحكم.</p></div>
      ) : (
        <div className="eah-admin-business-list">
          {businesses?.map((business) => (
            <article key={business.id} className="eah-admin-business-card">
              <div><div className="eah-admin-business-meta"><span className="eah-admin-business-name">{business.name}</span>{business.is_published && <span className="eah-admin-badge live">منشور</span>}{business.is_open && <span className="eah-admin-badge live">مفتوح</span>}</div><div className="eah-admin-business-sub">{[business.area, business.city].filter(Boolean).join(' • ') || 'الموقع غير محدد'}</div></div>
              <div className="eah-admin-actions"><a className="eah-admin-btn primary" href={`/businesses/${business.slug}`}>مشاهدة الصفحة ↗</a></div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
