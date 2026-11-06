import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAdminUserDetail, getStandingEvents, getViolationStats } from '@/lib/data/admin-user-detail'
import StandingCockpit from './standing-cockpit'
import UserDetailActions from './user-detail-actions'
import { ArrowLeftIcon, StarIcon, StoreIcon, ClockIcon } from '@/components/icons'

export const dynamic = 'force-dynamic'

function timeAgo(date: string) {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + ' سنة'
  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + ' شهر'
  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + ' يوم'
  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + ' ساعة'
  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + ' دقيقة'
  return 'الآن'
}

export default async function AdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const detail = await getAdminUserDetail(id)
  const standingHistory = await getStandingEvents(id)
  const violationStats = await getViolationStats(id)

  if (!detail) notFound()

  const { profile, role, auditLogs, businesses, reviews } = detail

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '16px', direction: 'rtl' }}>
      
      {/* زر الرجوع */}
      <Link href="/admin/users" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#a0a0a0', marginBottom: '24px', textDecoration: 'none' }}>
        <ArrowLeftIcon size={16} /> رجوع للمستخدمين
      </Link>

      {/* الهيدر */}
      <div style={{ background: 'rgba(20, 15, 30, 0.6)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(157, 78, 221, 0.2)', marginBottom: '16px' }}>
        <h1 style={{ color: '#fff', fontSize: '24px', marginBottom: '8px' }}>{profile.display_name || 'مستخدم'}</h1>
        <p style={{ color: '#a0a0a0', fontSize: '14px' }}>{profile.phone || 'بدون رقم'} • {role === 'merchant' ? 'تاجر' : role === 'super_admin' ? 'أدمن' : 'عميل'}</p>
        <p style={{ color: '#666', fontSize: '12px', marginTop: '8px' }}>تاريخ التسجيل: {new Date(profile.created_at).toLocaleString('ar-EG')}</p>
      </div>

      {/* لوحة القيادة (Cockpit) */}
      <StandingCockpit 
        userId={profile.id}
        currentStanding={profile.standing || 'good'}
        currentReason={profile.standing_reason}
        expiresAt={profile.standing_expires_at}
        history={standingHistory}
        violationStats={violationStats}
      />

      {/* باقي التفاصيل (الأنشطة، التقييمات، السجلات) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginTop: '16px' }}>
        
        {/* الأنشطة */}
        <div style={{ background: 'rgba(20, 15, 30, 0.6)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(157, 78, 221, 0.2)' }}>
          <h3 style={{ color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><StoreIcon size={16} /> الأنشطة</h3>
          {businesses.length === 0 ? <p style={{ color: '#666' }}>لا توجد أنشطة</p> : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {businesses.map(b => (
                <li key={b.id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#ccc' }}>{b.name}</li>
              ))}
            </ul>
          )}
        </div>

        {/* التقييمات */}
        <div style={{ background: 'rgba(20, 15, 30, 0.6)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(157, 78, 221, 0.2)' }}>
          <h3 style={{ color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><StarIcon size={16} /> التقييمات</h3>
          {reviews.length === 0 ? <p style={{ color: '#666' }}>لا توجد تقييمات</p> : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {reviews.map(r => (
                <li key={r.id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#ccc' }}>
                  {r.rating} نجوم - {r.business_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* السجلات */}
        <div style={{ background: 'rgba(20, 15, 30, 0.6)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(157, 78, 221, 0.2)', gridColumn: '1 / -1' }}>
          <h3 style={{ color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><ClockIcon size={16} /> آخر النشاطات</h3>
          {auditLogs.length === 0 ? <p style={{ color: '#666' }}>لا توجد نشاطات</p> : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {auditLogs.map(l => (
                <li key={l.id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', color: '#ccc' }}>
                  <span>{l.action}</span>
                  <span style={{ color: '#666', fontSize: '12px' }}>{timeAgo(l.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  )
}
