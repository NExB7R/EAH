'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

export default function ChangePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    void supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.replace('/auth')
    })
  }, [router])

  async function submit(event: FormEvent) {
    event.preventDefault()
    setMessage('')
    if (password.length < 8) return setMessage('كلمة المرور لازم تكون 8 أحرف/أرقام على الأقل.')
    if (password !== confirm) return setMessage('تأكيد كلمة المرور غير مطابق.')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) return setMessage(error.message)
    setMessage('تم تغيير كلمة المرور بنجاح ✅')
    setTimeout(() => router.push('/'), 700)
  }

  return (
    <main className="container" style={{ maxWidth: 560, paddingTop: 64 }}>
      <div className="eyebrow">EAH • SECURITY</div>
      <h1 style={{ marginTop: 10 }}>تغيير كلمة المرور</h1>
      <p className="lead">استخدم الصفحة دي وأنت داخل حسابك لتغيير كلمة المرور بأمان.</p>
      <form onSubmit={submit} className="card" style={{ marginTop: 20, padding: 22, display: 'grid', gap: 12 }}>
        <label className="meta" htmlFor="new-password">كلمة المرور الجديدة</label>
        <input id="new-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="8 أحرف أو أكثر" required style={{ width: '100%', padding: 14, borderRadius: 14, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)' }} />
        <label className="meta" htmlFor="confirm-password">تأكيد كلمة المرور</label>
        <input id="confirm-password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" placeholder="كرر كلمة المرور" required style={{ width: '100%', padding: 14, borderRadius: 14, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)' }} />
        <button className="primary" disabled={loading}>{loading ? 'جاري الحفظ…' : 'حفظ كلمة المرور 🔒'}</button>
      </form>
      {message && <p role="alert" style={{ marginTop: 12, lineHeight: 1.7, color: 'var(--muted)' }}>{message}</p>}
    </main>
  )
}
