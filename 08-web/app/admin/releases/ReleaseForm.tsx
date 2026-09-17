'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

const AUDIENCES = [
  { key: 'all', label: 'الكل' },
  { key: 'customers', label: 'العملاء' },
  { key: 'merchants', label: 'أصحاب الأنشطة' },
  { key: 'admins', label: 'الفريق' },
]

export default function ReleaseForm() {
  const [version, setVersion] = useState('0.8.5')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [audience, setAudience] = useState('all')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function submit() {
    if (!title.trim() || !version.trim()) { setMsg('العنوان والنسخة مطلوبين'); return }
    setBusy(true); setMsg(null)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('publish_release', {
        p_version: version.trim(),
        p_title: title.trim(),
        p_body: body.trim(),
        p_audience: audience,
      })
      if (error || !data?.ok) { setMsg('' + (data?.error ?? error?.message ?? 'فشل')) }
      else {
        setMsg(`تم النشر — ${data.notified} مستخدم وصله إشعار`)
        setTitle(''); setBody('')
        setTimeout(() => window.location.reload(), 1500)
      }
    } catch (e: any) { setMsg('' + e.message) }
    setBusy(false)
  }

  return (
    <section className="rel-form">
      <div className="rel-form__grid">
        <label className="rel-form__field">
          <span>النسخة *</span>
          <input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="0.8.5" dir="ltr" />
        </label>
        <label className="rel-form__field">
          <span>الجمهور *</span>
          <select value={audience} onChange={(e) => setAudience(e.target.value)}>
            {AUDIENCES.map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}
          </select>
        </label>
      </div>
      <label className="rel-form__field">
        <span>عنوان التحديث *</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: تحديثات جديدة في الأوردرات" />
      </label>
      <label className="rel-form__field">
        <span>تفاصيل (اختياري)</span>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="اكتب ملخص قصير عن التحديث" />
      </label>
      {msg && <p className={msg.startsWith('') ? 'rel-form__ok' : 'rel-form__err'}>{msg}</p>}
      <button type="button" onClick={submit} disabled={busy} className="rel-form__submit">
        {busy ? '...' : 'نشر التحديث'}
      </button>
    </section>
  )
}
