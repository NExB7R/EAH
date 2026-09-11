'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

export default function ChangePasswordPage() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState('')
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

    if (currentPassword.length < 1) return setMessage('اكتب كلمة المرور الحالية الأول.')
    if (password.length < 8) return setMessage('كلمة المرور الجديدة لازم تكون 8 أحرف/أرقام على الأقل.')
    if (password === currentPassword) return setMessage('اختار كلمة مرور جديدة مختلفة عن الحالية.')
    if (password !== confirm) return setMessage('تأكيد كلمة المرور غير مطابق.')

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.updateUser({
      password,
      current_password: currentPassword,
    })

    if (error) {
      setLoading(false)
      setMessage(error.message || 'تعذر تغيير كلمة المرور. تأكد من كلمة المرور الحالية.')
      return
    }

    // Revoke all other sessions while keeping this current session active.
    const { error: signOutOthersError } = await supabase.auth.signOut({ scope: 'others' })
    setLoading(false)

    if (signOutOthersError) {
      setMessage('تم تغيير كلمة المرور، لكن تعذر تسجيل خروج الأجهزة الأخرى. غيّر كلمة المرور مرة أخرى لاحقًا إذا لزم الأمر.')
      return
    }

    setMessage('تم تغيير كلمة المرور وتأمين الحساب ✅ تم تسجيل خروج باقي الأجهزة.')
    setCurrentPassword('')
    setPassword('')
    setConfirm('')
    setTimeout(() => router.push('/'), 1200)
  }

  return (
    <main className="container" style={{ maxWidth: 560, paddingTop: 64 }}>
      <div className="eyebrow">EAH • SECURITY</div>
      <h1 style={{ marginTop: 10 }}>تغيير كلمة المرور</h1>
      <p className="lead">مش هنسمح بتغيير كلمة المرور من غير معرفة كلمة المرور الحالية.</p>

      <form onSubmit={submit} className="card" style={{ marginTop: 20, padding: 22, display: 'grid', gap: 12 }}>
        <label className="meta" htmlFor="current-password">كلمة المرور الحالية</label>
        <input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" placeholder="اكتب كلمة المرور الحالية" required style={{ width: '100%', padding: 14, borderRadius: 14, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)' }} />

        <label className="meta" htmlFor="new-password">كلمة المرور الجديدة</label>
        <input id="new-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="8 أحرف أو أكثر" required style={{ width: '100%', padding: 14, borderRadius: 14, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)' }} />

        <label className="meta" htmlFor="confirm-password">تأكيد كلمة المرور الجديدة</label>
        <input id="confirm-password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" placeholder="كرر كلمة المرور الجديدة" required style={{ width: '100%', padding: 14, borderRadius: 14, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)' }} />

        <button className="primary" disabled={loading} style={{ minHeight: 50 }}>
          {loading ? 'جاري التأمين…' : 'تغيير كلمة المرور 🔒'}
        </button>
      </form>

      {message && <p role="alert" style={{ marginTop: 12, lineHeight: 1.7, color: 'var(--muted)' }}>{message}</p>}
    </main>
  )
}
