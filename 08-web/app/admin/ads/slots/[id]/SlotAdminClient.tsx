'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { IcBan, IcCheckCircle, IcEye, IcMouse } from '@/components/eah-icons'

type Ad = {
  id: string
  title: string
  description: string | null
  image_url: string | null
  link_url: string | null
  link_type: string
  status: string
  starts_at: string
  ends_at: string | null
  impressions: number
  clicks: number
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'مراجعة', active: 'شغال', paused: 'موقف', expired: 'منتهي', rejected: 'مرفوض',
}

export default function SlotAdminClient({ slot, ads }: { slot: any; ads: Ad[] }) {
  const [list, setList] = useState(ads)
  const [busy, setBusy] = useState<string | null>(null)

  async function setStatus(id: string, status: string) {
    setBusy(id)
    try {
      const supabase = createClient()
      await supabase.from('ads').update({ status }).eq('id', id)
      setList((prev) => prev.map((a) => a.id === id ? { ...a, status } : a))
    } catch {}
    setBusy(null)
  }

  return (
    <div className="slot__body">
      <section className="slot__stats">
        <div className="slot__stat">
          <span className="slot__stat-num">{list.filter((a) => a.status === 'active').length} / {slot.max_concurrent}</span>
          <span className="slot__stat-label">شغال</span>
        </div>
        <div className="slot__stat">
          <span className="slot__stat-num">{list.length}</span>
          <span className="slot__stat-label">إجمالي</span>
        </div>
        <div className="slot__stat">
          <span className="slot__stat-num">{list.reduce((s, a) => s + a.impressions, 0).toLocaleString('ar-EG')}</span>
          <span className="slot__stat-label">ظهور</span>
        </div>
        <div className="slot__stat">
          <span className="slot__stat-num">{list.reduce((s, a) => s + a.clicks, 0).toLocaleString('ar-EG')}</span>
          <span className="slot__stat-label">ضغط</span>
        </div>
      </section>

      {list.length === 0 ? (
        <p className="slot__empty">لسه مفيش إعلانات في المساحة دي</p>
      ) : (
        <div className="slot__ads">
          {list.map((a) => (
            <article key={a.id} className="slot-ad">
              {a.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.image_url} alt={a.title} className="slot-ad__img" />
              )}
              <div className="slot-ad__body">
                <h3 className="slot-ad__title">{a.title}</h3>
                {a.description && <p className="slot-ad__desc">{a.description}</p>}
                <div className="slot-ad__meta">
                  <span className={`slot-ad__status is-${a.status}`}>{STATUS_LABEL[a.status]}</span>
                  <span><IcEye /> {a.impressions}</span>
                  <span><IcMouse /> {a.clicks}</span>
                </div>
              </div>
              <div className="slot-ad__actions">
                {a.status === 'pending' && (
                  <>
                    <button type="button" disabled={busy === a.id} onClick={() => setStatus(a.id, 'active')} className="slot-ad__btn slot-ad__btn--ok"><IcCheckCircle /> موافقة</button>
                    <button type="button" disabled={busy === a.id} onClick={() => setStatus(a.id, 'rejected')} className="slot-ad__btn slot-ad__btn--no"><IcBan /> رفض</button>
                  </>
                )}
                {a.status === 'active' && (
                  <button type="button" disabled={busy === a.id} onClick={() => setStatus(a.id, 'paused')} className="slot-ad__btn">⏸ إيقاف</button>
                )}
                {a.status === 'paused' && (
                  <button type="button" disabled={busy === a.id} onClick={() => setStatus(a.id, 'active')} className="slot-ad__btn slot-ad__btn--ok">▶ تشغيل</button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
