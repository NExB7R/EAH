'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

type Slot = { id: string; code: string; name_ar: string; slot_type: string }

export default function CreateAdForm({ slots }: { slots: Slot[] }) {
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [slotId, setSlotId] = useState(slots[0]?.id ?? '')
  const [days, setDays] = useState(30)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function submit() {
    if (!title.trim() || !slotId) { setErr('الاسم والمساحة مطلوبين'); return }
    setBusy(true); setErr(null); setMsg(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setErr('لازم تسجل'); return }

      const startsAt = new Date()
      const endsAt = new Date(startsAt.getTime() + days * 86400_000)

      const { error } = await supabase.from('ads').insert({
        slot_id: slotId,
        owner_profile_id: user.id,
        title: title.trim(),
        description: desc.trim() || null,
        image_url: imageUrl.trim() || null,
        link_url: linkUrl.trim() || null,
        link_type: linkUrl.startsWith('http') ? 'external' : 'internal',
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        status: 'pending',
      })
      if (error) { setErr(error.message); return }
      setMsg('✅ تم الإرسال — هيتم المراجعة قريب')
      setTimeout(() => window.location.href = '/merchant/ads', 1500)
    } catch (e: any) { setErr(e.message) }
    finally { setBusy(false) }
  }

  return (
    <div className="anew__form">
      <label className="anew__field">
        <span>📢 عنوان الإعلان *</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثلاً: خصم 20% على العروض" />
      </label>

      <label className="anew__field">
        <span>📝 وصف مختصر</span>
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} placeholder="جملة أو اتنين توضح العرض" />
      </label>

      <label className="anew__field">
        <span>🖼 رابط الصورة (اختياري)</span>
        <input type="url" dir="ltr" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
      </label>

      <label className="anew__field">
        <span>🔗 الرابط (اختياري)</span>
        <input type="url" dir="ltr" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://...  أو  /businesses/..." />
      </label>

      <div className="anew__row">
        <label className="anew__field">
          <span>📍 المساحة *</span>
          <select value={slotId} onChange={(e) => setSlotId(e.target.value)}>
            {slots.map((s) => <option key={s.id} value={s.id}>{s.name_ar}</option>)}
          </select>
        </label>
        <label className="anew__field">
          <span>📅 المدة (يوم)</span>
          <input type="number" min={1} max={365} value={days} onChange={(e) => setDays(Number(e.target.value))} />
        </label>
      </div>

      {err && <p className="anew__err">⚠ {err}</p>}
      {msg && <p className="anew__ok">{msg}</p>}

      <button type="button" onClick={submit} disabled={busy} className="anew__submit">
        {busy ? '...' : '🚀 إرسال للمراجعة'}
      </button>

      <p className="anew__note">
        💬 الإعلان هيتحط قيد المراجعة — هنشوفه ونوافق عليه. للأسعار كلمنا على واتساب.
      </p>
    </div>
  )
}
