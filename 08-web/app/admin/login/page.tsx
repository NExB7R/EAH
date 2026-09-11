'use client'

import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      window.location.href = '/admin'
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'بيانات الدخول غير صحيحة.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container" style={{ paddingTop: 72, maxWidth: 520 }} dir="rtl">
      <div className="eyebrow">B7R CONTROL</div>
      <h1 style={{ fontSize: 'clamp(2.1rem, 7vw, 3.4rem)' }}>دخول لوحة التحكم</h1>
      <p className="lead">الدخول هنا مخصص لحسابات B7R المصرح لها. حساب السوبر أدمن بياخد الصلاحيات من role في Supabase.</p>

      <form onSubmit={submit} className="card" style={{ padding: 20, marginTop: 24, display: 'grid', gap: 14 }}>
        <label htmlFor="email" className="meta">البريد الإلكتروني</label>
        <input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="owner@example.com" style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', padding: 14, borderRadius: 14 }} />

        <label htmlFor="password" className="meta">كلمة المرور</label>
        <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', padding: 14, borderRadius: 14 }} />

        <button className="primary" disabled={loading}>{loading ? 'جاري الدخول…' : 'دخول B7R'}</button>
      </form>

      {message && <p role="alert" style={{ marginTop: 12, color: 'var(--muted)', lineHeight: 1.7 }}>{message}</p>}
    </main>
  )
}
