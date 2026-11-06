'use client'
import { useState } from 'react'
import { manageStandingAction } from '../actions'

export default function StandingCockpit({ 
  userId, 
  currentStanding, 
  currentReason, 
  expiresAt 
}: { 
  userId: string, 
  currentStanding: string, 
  currentReason: string | null, 
  expiresAt: string | null 
}) {
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [actionType, setActionType] = useState('warn')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.append('userId', userId)
    formData.append('action', actionType)
    
    await manageStandingAction(formData)
    setLoading(false)
    setShowForm(false)
    // إعادة تحميل الصفحة لتحديث البيانات
    window.location.reload()
  }

  const openAction = (type: string) => {
    setActionType(type)
    setShowForm(true)
  }

  // ألوان الحالة
  const colors: Record<string, string> = {
    excellent: '#4ade80', // أخضر
    good: '#a0a0a0',      // رمادي
    warning: '#facc15',   // أصفر
    restricted: '#f97316',// برتقالي
    suspended: '#ef4444', // أحمر
  }

  const labels: Record<string, string> = {
    excellent: 'عضو مميز',
    good: 'عضو',
    warning: 'تحت المراقبة',
    restricted: 'مقيد',
    suspended: 'موقوف',
  }

  return (
    <div style={{ background: 'rgba(20, 15, 30, 0.6)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(157, 78, 221, 0.2)', marginTop: '16px' }}>
      <h3 style={{ color: '#fff', marginBottom: '16px' }}>لوحة قيادة الالتزام (Cockpit)</h3>
      
      {/* عرض الحالة الحالية */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '12px' }}>
        <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: colors[currentStanding] || '#fff' }}></span>
        <span style={{ color: '#fff', fontWeight: 'bold' }}>{labels[currentStanding] || currentStanding}</span>
        {expiresAt && <span style={{ color: '#a0a0a0', fontSize: '12px' }}>(ينتهي في: {new Date(expiresAt).toLocaleDateString('ar-EG')})</span>}
      </div>
      {currentReason && <p style={{ color: '#ffa500', fontSize: '12px', marginBottom: '16px' }}>السبب: {currentReason}</p>}

      {/* أزرار التحكم */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <button onClick={() => openAction('pardon')} style={{ padding: '10px', borderRadius: '8px', background: 'rgba(74, 222, 128, 0.2)', color: '#4ade80', border: '1px solid #4ade80', cursor: 'pointer' }}>إعفاء (Pardon)</button>
        <button onClick={() => openAction('warn')} style={{ padding: '10px', borderRadius: '8px', background: 'rgba(250, 204, 21, 0.2)', color: '#facc15', border: '1px solid #facc15', cursor: 'pointer' }}>تحذير (Warn)</button>
        <button onClick={() => openAction('restrict')} style={{ padding: '10px', borderRadius: '8px', background: 'rgba(249, 115, 22, 0.2)', color: '#f97316', border: '1px solid #f97316', cursor: 'pointer' }}>تقييد (Restrict)</button>
        <button onClick={() => openAction('suspend')} style={{ padding: '10px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid #ef4444', cursor: 'pointer' }}>حظر (Suspend)</button>
      </div>

      {/* نموذج الإدخال */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginTop: '16px', background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px' }}>
          <h4 style={{ color: '#fff', marginBottom: '12px' }}>تأكيد الإجراء: {labels[actionType === 'pardon' ? 'good' : actionType === 'warn' ? 'warning' : actionType === 'restrict' ? 'restricted' : 'suspended']}</h4>
          
          {actionType !== 'pardon' && (
            <div style={{ marginBottom: '12px' }}>
              <label style={{ color: '#a0a0a0', fontSize: '12px', display: 'block', marginBottom: '4px' }}>المدة (بالأيام) - اتركه 0 للحظر الدائم</label>
              <input type="number" name="durationDays" defaultValue={actionType === 'warn' ? 7 : actionType === 'restrict' ? 30 : 0} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #333', background: '#111', color: '#fff' }} />
            </div>
          )}

          <div style={{ marginBottom: '12px' }}>
            <label style={{ color: '#a0a0a0', fontSize: '12px', display: 'block', marginBottom: '4px' }}>السبب</label>
            <input type="text" name="reason" required placeholder="اكتب السبب هنا..." style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #333', background: '#111', color: '#fff' }} />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#9D4EDD', color: '#fff', border: 'none', cursor: 'pointer' }}>{loading ? 'جاري...' : 'تنفيذ'}</button>
            <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#333', color: '#fff', border: 'none', cursor: 'pointer' }}>إلغاء</button>
          </div>
        </form>
      )}
    </div>
  )
}
