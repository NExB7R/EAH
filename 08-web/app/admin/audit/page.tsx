import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'سجل العمليات | EAH Admin' }

type Log = {
  id: string
  actor_user_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export default async function AuditPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/admin/login')

  const { data: roleRow } = await supabase
    .from('user_roles').select('role').eq('user_id', userData.user.id).maybeSingle()
  if (roleRow?.role !== 'super_admin') redirect('/')

  const { data, error } = await supabase
    .from('audit_logs')
    .select('id,actor_user_id,action,entity_type,entity_id,metadata,created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    return (
      <div className="admin-empty">
        <span className="admin-empty__emoji">⚠️</span>
        <h2 className="admin-empty__title">حصل خطأ</h2>
        <p className="admin-empty__msg">{error.message}</p>
      </div>
    )
  }

  const rows = (data ?? []) as Log[]

  const actionLabel = (a: string) => {
    const map: Record<string, string> = {
      'business.create': '➕ إضافة نشاط',
      'business.update': '✏️ تعديل',
      'business.delete': '🗑 حذف نشاط',
      'business.toggle_featured': '⭐ مميز',
      'business.toggle_published': '📢 نشر',
    }
    return map[a] ?? a
  }

  return (
    <>
      <div className="admin-header">
        <div className="admin-header__info">
          <span className="admin-header__kicker">AUDIT LOG</span>
          <h1 className="admin-header__title">📜 سجل العمليات</h1>
          <p className="admin-header__subtitle">{rows.length} عملية — آخر 200 عملية</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="admin-empty">
          <span className="admin-empty__emoji">📜</span>
          <h2 className="admin-empty__title">مفيش عمليات</h2>
          <p className="admin-empty__msg">لسه مفيش عمليات مسجلة</p>
        </div>
      ) : (
        <div className="audit-list">
          {rows.map((log) => (
            <div key={log.id} className="audit-item">
              <div className="audit-item__icon">
                {log.action.includes('delete') ? '🗑' :
                 log.action.includes('create') ? '➕' :
                 log.action.includes('toggle') ? '🔄' : '✏️'}
              </div>
              <div className="audit-item__body">
                <div className="audit-item__head">
                  <span className="audit-item__action">{actionLabel(log.action)}</span>
                  <span className="audit-item__entity">{log.entity_type}</span>
                </div>
                <div className="audit-item__meta">
                  {typeof log.metadata?.actor_email === 'string' && (
                    <span>👤 {log.metadata.actor_email}</span>
                  )}
                  <span>🕐 {new Date(log.created_at).toLocaleString('ar-EG')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
