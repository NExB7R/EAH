import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'

export default async function AdminChangeRequestsPage() {
  const supabase = await createClient()
  const { data: requests } = await supabase
    .from('business_change_requests')
    .select('id,business_id,submitted_by,entity_type,operation,status,admin_note,created_at,reviewed_at')
    .order('created_at', { ascending: false })
    .limit(100)

  const rows = requests ?? []
  const businessIds = [...new Set(rows.map((row) => row.business_id))]
  const userIds = [...new Set(rows.map((row) => row.submitted_by))]

  const [{ data: businesses }, { data: profiles }] = await Promise.all([
    businessIds.length ? supabase.from('businesses').select('id,name,slug').in('id', businessIds) : Promise.resolve({ data: [] as any[] }),
    userIds.length ? supabase.from('profiles').select('id,display_name,phone').in('id', userIds) : Promise.resolve({ data: [] as any[] }),
  ])

  const businessMap = new Map((businesses ?? []).map((b) => [b.id, b]))
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))
  const pendingCount = rows.filter((row) => row.status === 'pending').length

  return (
    <section>
      <header className="eah-admin-page-header">
        <div>
          <span className="eah-admin-kicker">CONTENT REVIEW</span>
          <h1>مراجعة تعديلات أصحاب الأنشطة</h1>
          <p>ولا تعديل من صاحب النشاط يوصل للإنتاج قبل موافقة الأدمن.</p>
        </div>
        <div className="eah-admin-stat"><strong>{pendingCount}</strong><span>قيد المراجعة</span></div>
      </header>

      {rows.length === 0 ? (
        <div className="card" style={{ padding: 24 }}>مفيش طلبات تعديلات حتى الآن.</div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {rows.map((row) => {
            const business = businessMap.get(row.business_id)
            const profile = profileMap.get(row.submitted_by)
            const statusLabel = row.status === 'pending' ? 'قيد المراجعة' : row.status === 'approved' ? 'تم الاعتماد' : row.status === 'rejected' ? 'مرفوض' : 'ملغي'
            return (
              <article key={row.id} className="eah-admin-business-card">
                <div>
                  <div className="eah-admin-business-meta">
                    <span className="eah-admin-business-name">{business?.name ?? 'نشاط غير معروف'}</span>
                    <span className={`eah-admin-badge ${row.status === 'pending' ? '' : 'live'}`}>{statusLabel}</span>
                  </div>
                  <div className="eah-admin-business-sub">
                    {(profile?.display_name || profile?.phone || 'صاحب النشاط') + ' • ' + row.entity_type + ' • ' + row.operation}
                  </div>
                </div>
                <div className="eah-admin-actions">
                  <Link className="eah-admin-btn primary" href={`/admin/change-requests/${row.id}`}>مراجعة الطلب</Link>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
