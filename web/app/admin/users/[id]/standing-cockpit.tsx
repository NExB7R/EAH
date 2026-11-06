'use client'
import { useState } from 'react'
import { manageStandingAction } from '../actions'

export default function StandingCockpit({ 
  userId, currentStanding, currentReason, expiresAt, history, violationStats
}: { 
  userId: string, currentStanding: string, currentReason: string | null,
  expiresAt: string | null, history: any[], violationStats: any
}) {
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [actionType, setActionType] = useState('warn')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setLoading(true)
    const fd = new FormData(e.currentTarget)
    fd.append('userId', userId); fd.append('action', actionType)
    await manageStandingAction(fd)
    setLoading(false); setShowForm(false); window.location.reload()
  }

  const colors: Record<string,string> = { excellent:'#4ade80', good:'#a0a0a0', warning:'#facc15', restricted:'#f97316', suspended:'#ef4444' }
  const labels: Record<string,string> = { excellent:'عضو مميز', good:'عضو', warning:'تحت المراقبة', restricted:'مقيد', suspended:'موقوف' }
  const aLabels: Record<string,string> = { warn:'تحذير', restrict:'تقييد', suspend:'حظر', pardon:'إعفاء', auto_penalize:'عقوبة تلقائية', auto_expire:'انتهت تلقائيًا' }

  return (
    <div style={{ background:'rgba(20,15,30,0.6)', padding:'20px', borderRadius:'20px', border:'1px solid rgba(157,78,221,0.2)', marginTop:'16px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
        <h3 style={{ color:'#fff', margin:0 }}>لوحة قيادة الالتزام</h3>
        <span style={{ fontSize:'12px', background:'rgba(157,78,221,0.2)', color:'#C77DFF', padding:'4px 8px', borderRadius:'8px' }}>🤖 الطيار الآلي مُفعل</span>
      </div>

      {/* الحالة الحالية */}
      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px', background:'rgba(0,0,0,0.2)', padding:'12px', borderRadius:'12px' }}>
        <span style={{ width:'12px', height:'12px', borderRadius:'50%', background: colors[currentStanding] || '#fff' }}></span>
        <span style={{ color:'#fff', fontWeight:'bold' }}>{labels[currentStanding] || currentStanding}</span>
        {expiresAt && <span style={{ color:'#a0a0a0', fontSize:'12px' }}>(ينتهي: {new Date(expiresAt).toLocaleString('ar-EG')})</span>}
      </div>
      {currentReason && <p style={{ color:'#ffa500', fontSize:'12px', marginBottom:'12px' }}>السبب الأخير: {currentReason}</p>}

      {/* عداد المخالفات */}
      <div style={{ background:'rgba(0,0,0,0.3)', padding:'12px', borderRadius:'12px', marginBottom:'16px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px', color:'#ccc', fontSize:'13px' }}>
          <span>المخالفات (30 يوم): {violationStats?.weighted || 0} نقطة ({violationStats?.total || 0} مخالفة)</span>
          {violationStats?.nextThreshold && (
            <span style={{ color:'#facc15', fontSize:'11px' }}>باقي {violationStats.nextThreshold.at - violationStats.weighted} لـ {violationStats.nextThreshold.level}</span>
          )}
        </div>
        <div style={{ width:'100%', height:'8px', background:'rgba(255,255,255,0.1)', borderRadius:'4px', overflow:'hidden' }}>
          <div style={{ width: `${Math.min((violationStats?.weighted || 0) / 10 * 100, 100)}%`, height:'100%',
            background: `linear-gradient(90deg, ${(violationStats?.weighted || 0) >= 6 ? '#ef4444' : (violationStats?.weighted || 0) >= 3 ? '#f97316' : '#4ade80'}, #C77DFF)` }}></div>
        </div>
      </div>

      {/* أزرار التحكم */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'16px' }}>
        <button onClick={() => { setActionType('pardon'); setShowForm(true) }} style={{ padding:'10px', borderRadius:'8px', background:'rgba(74,222,128,0.2)', color:'#4ade80', border:'1px solid #4ade80', cursor:'pointer' }}>إعفاء</button>
        <button onClick={() => { setActionType('warn'); setShowForm(true) }} style={{ padding:'10px', borderRadius:'8px', background:'rgba(250,204,21,0.2)', color:'#facc15', border:'1px solid #facc15', cursor:'pointer' }}>تحذير</button>
        <button onClick={() => { setActionType('restrict'); setShowForm(true) }} style={{ padding:'10px', borderRadius:'8px', background:'rgba(249,115,22,0.2)', color:'#f97316', border:'1px solid #f97316', cursor:'pointer' }}>تقييد</button>
        <button onClick={() => { setActionType('suspend'); setShowForm(true) }} style={{ padding:'10px', borderRadius:'8px', background:'rgba(239,68,68,0.2)', color:'#ef4444', border:'1px solid #ef4444', cursor:'pointer' }}>حظر</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginTop:'16px', background:'rgba(0,0,0,0.3)', padding:'16px', borderRadius:'12px' }}>
          <h4 style={{ color:'#fff', marginBottom:'12px' }}>تأكيد: {aLabels[actionType]}</h4>
          {actionType !== 'pardon' && (
            <div style={{ marginBottom:'12px' }}>
              <label style={{ color:'#a0a0a0', fontSize:'12px', display:'block', marginBottom:'4px' }}>المدة (أيام) - 0 يعني دائم</label>
              <input type="number" name="durationDays" defaultValue={actionType === 'warn' ? 7 : actionType === 'restrict' ? 30 : 0} style={{ width:'100%', padding:'8px', borderRadius:'8px', border:'1px solid #333', background:'#111', color:'#fff' }} />
            </div>
          )}
          <div style={{ marginBottom:'12px' }}>
            <label style={{ color:'#a0a0a0', fontSize:'12px', display:'block', marginBottom:'4px' }}>السبب</label>
            <input type="text" name="reason" required style={{ width:'100%', padding:'8px', borderRadius:'8px', border:'1px solid #333', background:'#111', color:'#fff' }} />
          </div>
          <div style={{ display:'flex', gap:'8px' }}>
            <button type="submit" disabled={loading} style={{ flex:1, padding:'10px', borderRadius:'8px', background:'#9D4EDD', color:'#fff', border:'none', cursor:'pointer' }}>{loading ? 'جاري...' : 'تنفيذ'}</button>
            <button type="button" onClick={() => setShowForm(false)} style={{ flex:1, padding:'10px', borderRadius:'8px', background:'#333', color:'#fff', border:'none', cursor:'pointer' }}>إلغاء</button>
          </div>
        </form>
      )}

      {/* السجل */}
      <div style={{ marginTop:'24px', borderTop:'1px solid rgba(255,255,255,0.1)', paddingTop:'16px' }}>
        <h4 style={{ color:'#a0a0a0', marginBottom:'12px', fontSize:'14px' }}>سجل العقوبات</h4>
        {history.length === 0 ? <p style={{ color:'#666', fontSize:'12px' }}>لا توجد عقوبات.</p> : (
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {history.map((h) => (
              <div key={h.id} style={{ background:'rgba(255,255,255,0.05)', padding:'10px', borderRadius:'8px', fontSize:'12px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                  <span style={{ color: colors[h.new_standing] || '#fff', fontWeight:'bold' }}>{aLabels[h.action] || h.action}</span>
                  <span style={{ color:'#888' }}>{new Date(h.created_at).toLocaleString('ar-EG', { dateStyle:'short', timeStyle:'short' })}</span>
                </div>
                <div style={{ color:'#ccc' }}>السبب: {h.reason}</div>
                <div style={{ color:'#666', fontSize:'10px', marginTop:'4px' }}>بواسطة: {h.admin_name || '🤖 النظام التلقائي'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
