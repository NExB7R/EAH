'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

export default function AdminVerifyPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    void supabase.auth.getUser().then(({ data }) => {
      if (!data.user?.email) {
        router.replace('/auth')
        return
      }
      setEmail(data.user.email)
    })
  }, [router])

  async function verify(event: FormEvent) {
    event.preventDefault()
    setMessage('')
    if (!email) {
      setMessage('تعذر التحقق من جلسة الحساب. سجّل الدخول مرة أخرى.')
      return
    }
    if (!password) {
      setMessage('اكتب كلمة المرور لتأكيد الهوية.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (error) {
      setMessage('كلمة المرور غير صحيحة أو تعذر تأكيد الهوية.')
      return
    }

    router.replace('/admin')
    router.refresh()
  }

  return (
    <main className="container" style={{ maxWidth: 560, paddingTop: 72 }}>
      <div className="eyebrow">EAH • ADMIN SECURITY</div>
      <h1 style={{ marginTop: 10 }}>تأكيد الدخول للإدارة 🔐</h1>
      <p className="lead" style={{ marginTop: 10 }}>
        للدخول إلى لوحة Super Admin لازم نعيد تأكيد كلمة المرور. ده بيحمي الإدارة حتى لو الجهاز مفتوح بالفعل.
      </p>

      <form onSubmit={verify} className="card" style={{ marginTop: 20, padding: 22, display: 'grid', gap: 12 }}>
        <div className="card" style={{ padding: 14, opacity: .82 }}>
          <strong>الحساب الحالي</strong>
          <div style={{ marginTop: 4, direction: 'ltr', wordBreak: 'break-word', opacity: .72 }}>{email ?? 'جاري التحقق…'}</div>
        </div>

        <label className="meta" htmlFor="admin-password">كلمة المرور</label>
        <input id="admin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" placeholder="كلمة المرور الحالية" required style={{ width: '100%', padding: 14, borderRadius: 14, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)' }} />

        <button className="primary" disabled={loading || !email} style={{ minHeight: 50 }}>
          {loading ? 'جاري التحقق…' : 'دخول آمن للإدارة 🔐'}
        </button>
      </form>

      {message && <p role="alert" style={{ marginTop: 12, lineHeight: 1.7, color: 'var(--muted)' }}>{message}</p>}
    </main>
  )
}
