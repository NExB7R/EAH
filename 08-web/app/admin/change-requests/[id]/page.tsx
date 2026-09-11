import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase-server'

export default async function AdminChangeRequestDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: request } = await supabase
    .from('business_change_requests')
    .select('id,business_id,submitted_by,entity_type,operation,target_id,payload,status,admin_note,created_at,reviewed_at')
    .eq('id', id)
    .maybeSingle()

  if (!request) redirect('/admin/change-requests')

  const [{ data: business }, { data: profile }] = await Promise.all([
    supabase.from('businesses').select('id,name,slug').eq('id', request.business_id).maybeSingle(),
    supabase.from('profiles').select('id,display_name,phone').eq('id', request.submitted_by).maybeSingle(),
  ])

  async function review(formData: FormData) {
    'use server'
    const client = await createClient()
    const { data: authData } = await client.auth.getUser()
    if (!authData.user) redirect('/auth')

    const decision = String(formData.get('decision') ?? '')
    const note = String(formData.get('admin_note') ?? '').trim() || null
    if (decision !== 'approved' && decision !== 'rejected') throw new Error('قرار مراجعة غير صالح.')

    const { error } = await client.rpc('admin_review_business_change_request', {
      p_request_id: id,
      p_decision: decision,
      p_admin_note: note,
    })
    if (error) throw new Error(error.message)

    revalidatePath('/admin/change-requests')
    revalidatePath(`/admin/change-requests/${id}`)
    revalidatePath('/merchant')
    if (business?.slug) revalidatePath(`/businesses/${business.slug}`)
    redirect('/admin/change-requests')
  }

  return (
    <section>
      <header className="eah-admin-page-header">
        <div>
          <span className="eah-admin-kicker">REVIEW REQUEST</span>
          <h1>مراجعة تعديل: {business?.name ?? 'نشاط'}</h1>
          <p>الطلب من {profile?.display_name || profile?.phone || 'صاحب النشاط'} • {request.entity_type} • {request.operation}</p>
        </div>
        <a className="eah-admin-btn" href="/admin/change-requests">← كل الطلبات</a>
      </header>

      <div style={{ display: 'grid', gap: 16, maxWidth: 900 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ marginBottom: 10 }}><strong>الحالة:</strong> {request.status}</div>
          <div style={{ marginBottom: 10 }}><strong>أُرسل:</strong> {new Date(request.created_at).toLocaleString('ar-EG')}</div>
          <pre style={{ whiteSpace: 'pre-wrap', overflowX: 'auto', margin: 0, padding: 16, borderRadius: 14, background: 'rgba(0,0,0,.28)' }}>{JSON.stringify(request.payload, null, 2)}</pre>
        </div>

        {request.status === 'pending' ? (
          <div className="card" style={{ padding: 24 }}>
            <form action={review} style={{ display: 'grid', gap: 14 }}>
              <label>ملاحظة للمطعم (اختياري)<textarea name="admin_note" rows={4} placeholder="سبب الرفض أو ملاحظة الاعتماد" /></label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="eah-admin-btn primary" type="submit" name="decision" value="approved">✅ اعتماد ونشر</button>
                <button className="eah-admin-btn" type="submit" name="decision" value="rejected">رفض التعديل</button>
              </div>
            </form>
          </div>
        ) : (
          <div className="card" style={{ padding: 24 }}>
            <strong>الطلب اتراجع بالفعل.</strong>
            <div style={{ opacity: .75, marginTop: 6 }}>{request.admin_note || 'لا توجد ملاحظة.'}</div>
          </div>
        )}
      </div>
    </section>
  )
}
