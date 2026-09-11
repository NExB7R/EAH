'use client'

import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function signIn(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      window.location.href = '/admin'
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'البريد الإلكتروني أو كلمة المرور غير صحيحة.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container" style={{ paddingTop: 56, maxWidth: 560 }}>
      <div className="eyebrow">EAH</div>
      <h1 style={{ fontSize: 'clamp(2rem, 7vw, 3rem)' }}>تسجيل الدخول</h1>
      <p style={{ color: 'var(--muted)', lineHeight: 1.8 }}>
        ادخل بحسابك للوصول إلى لوحة B7R Control.
      </p>

      <form onSubmit={signIn} className="card" style={{ padding: 18, marginTop: 20 }}>
        <label htmlFor="email" className="meta">البريد الإلكتروني</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          required
          autoComplete="email"
          style={{ width: '100%', margin: '8px 0 12px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', padding: 14, borderRadius: 14 }}
        />

        <label htmlFor="password" className="meta">كلمة المرور</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="current-password"
          style={{ width: '100%', margin: '8px 0 12px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', padding: 14, borderRadius: 14 }}
        />

        <button className="primary" disabled={loading}>
          {loading ? 'جاري تسجيل الدخول…' : 'دخول'}
        </button>
      </form>

      {message && <p role="alert" style={{ marginTop: 12, color: 'var(--muted)', lineHeight: 1.7 }}>{message}</p>}
    </main>
  )
}
