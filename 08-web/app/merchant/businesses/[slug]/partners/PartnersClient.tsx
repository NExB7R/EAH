'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { IcAlert, IcCheckCircle, IcRefresh, IcUsers } from '@/components/eah-icons'

type Partner = {
  id: string
  profile_id: string
  role: string
  profile?: { display_name: string | null; phone: string | null }
}

export default function PartnersClient({
  businessId,
  businessSlug,
  partners,
}: {
  businessId: string
  businessSlug: string
  partners: Partner[]
}) {
  const [list, setList] = useState(partners)
  const [phone, setPhone] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function transfer() {
    if (!phone.trim()) return
    setBusy(true); setMsg(null); setErr(null)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('transfer_business_ownership', {
        p_business_id: businessId,
        p_new_owner_phone: phone.trim(),
      })
      if (error || !data?.ok) {
        setErr(data?.error ?? error?.message ?? 'فشل')
      } else {
        setMsg('تم نقل الملكية بنجاح ')
        setPhone('')
        setTimeout(() => window.location.reload(), 1500)
      }
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="ptn__body">
      <section className="ptn__section">
        <h2 className="ptn__section-title"><IcUsers /> المسئولين الحاليين ({list.length})</h2>
        {list.length === 0 ? (
          <p className="ptn__empty">لسه مفيش شركاء — إنت المالك الوحيد</p>
        ) : (
          <div className="ptn__list">
            {list.map((p) => (
              <div key={p.id} className="ptn__row">
                <span className="ptn__avatar">{p.profile?.display_name?.[0] ?? '?'}</span>
                <div className="ptn__info">
                  <strong>{p.profile?.display_name ?? '—'}</strong>
                  <span dir="ltr">{p.profile?.phone ?? '—'}</span>
                </div>
                <span className={`ptn__role ${p.role === 'owner' ? 'is-owner' : ''}`}>
                  {p.role === 'owner' ? 'مالك' : 'شريك'}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="ptn__section ptn__section--transfer">
        <h2 className="ptn__section-title"><IcRefresh /> نقل الملكية الكاملة</h2>
        <p className="ptn__hint">
          اكتب رقم الموبايل المسجّل في EAH — هياخد ملكية النشاط بالكامل.
          العملية نهائية ومش بترجع.
        </p>
        <div className="ptn__transfer-row">
          <input
            type="tel"
            dir="ltr"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="01xxxxxxxxx"
            className="ptn__input"
          />
          <button type="button" onClick={transfer} disabled={busy || !phone.trim()} className="ptn__btn">
            {busy ? '...' : 'نقل الملكية'}
          </button>
        </div>
        {err && <p className="ptn__err"><IcAlert /> {err}</p>}
        {msg && <p className="ptn__ok"><IcCheckCircle /> {msg}</p>}
      </section>
    </div>
  )
}
