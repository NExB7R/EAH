import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase-server'

async function reviewApplication(formData: FormData) {
  'use server'
  const id = String(formData.get('id') || '')
  const status = String(formData.get('status') || '')
  const adminNote = String(formData.get('admin_note') || '').trim()
  if (!id || !['approved', 'rejected'].includes(status)) throw new Error('بيانات المراجعة غير صحيحة.')

  const supabase = await createClient()
  const { error } = await supabase.from('merchant_applications').update({ status, admin_note: adminNote || null }).eq('id', id).eq('status', 'pending')
  if (error) throw new Error(error.message)
  revalidatePath('/admin/merchants')
}

export default async function AdminMerchantsPage() {
  const supabase = await createClient()
  const { data: applications, error } = await supabase
    .from('merchant_applications')
    .select('id,user_id,business_name,category,description,status,admin_note,created_at')
    .order('created_at', { ascending: false })

  if (error) return <section><h1>طلبات أصحاب الأنشطة</h1><p className="lead">تعذر تحميل الطلبات.</p></section>

  const userIds = [...new Set((applications ?? []).map((a) => a.user_id))]
  const { data: profiles } = userIds.length ? await supabase.from('profiles').select('id,display_name,phone,phone_e164').in('id', userIds) : { data: [] as any[] }
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))

  return (
    <section>
      <header className="eah-admin-header"><div><span className="eah-admin-kicker">MERCHANT REVIEW</span><h1>طلبات أصحاب الأنشطة</h1><p>راجع الطلب، وافق أو ارفض، وبعد الموافقة يصبح الحساب Merchant.</p></div></header>
      <div className="eah-admin-business-list">
        {(applications ?? []).map((application) => {
          const profile = profileMap.get(application.user_id)
          return <article key={application.id} className="eah-admin-business-card"><div style={{ minWidth: 0 }}><div className="eah-admin-business-meta"><strong className="eah-admin-business-name">{application.business_name}</strong><span className="eah-admin-badge">{application.status}</span></div><div className="eah-admin-business-sub">{profile?.display_name || 'بدون اسم'} • {profile?.phone || profile?.phone_e164 || 'بدون رقم'} • {application.category}</div>{application.description && <p style={{ marginTop: 10 }}>{application.description}</p>}</div>{application.status === 'pending' && <form action={reviewApplication} className="eah-admin-actions"><input type="hidden" name="id" value={application.id} /><input name="admin_note" placeholder="ملاحظة اختيارية" className="eah-admin-search" /><button className="eah-admin-btn primary" name="status" value="approved">موافقة</button><button className="eah-admin-btn" name="status" value="rejected">رفض</button></form>}</article>
        })}
      </div>
    </section>
  )
}
