'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import './turnstile.css'

type Factor = { id: string; friendly_name?: string; status: string }

export default function TwoFactorSetup({ factors: initial }: { factors: Factor[] }) {
  const [factors, setFactors] = useState(initial)
  const [step, setStep] = useState<'idle' | 'enrolling' | 'verifying'>('idle')
  const [qr, setQr] = useState<string>('')
  const [secret, setSecret] = useState<string>('')
  const [factorId, setFactorId] = useState<string>('')
  const [code, setCode] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function start() {
    setErr(null); setLoading(true)
    try {
      const sb = createClient()
      const { data, error } = await (sb.auth as any).mfa.enroll({ factorType: 'totp', friendlyName: 'EAH Authenticator' })
      if (error) throw error
      setQr(data.totp.qr_code)
      setSecret(data.totp.secret)
      setFactorId(data.id)
      setStep('verifying')
    } catch (e: any) {
      setErr(e?.message ?? 'MFA مش مفعل في Supabase — راجع الداشبورد')
    }
    setLoading(false)
  }

  async function verify() {
    setErr(null); setLoading(true)
    try {
      const sb = createClient()
      const { data: ch, error: ce } = await (sb.auth as any).mfa.challenge({ factorId })
      if (ce) throw ce
      const { error: ve } = await (sb.auth as any).mfa.verify({ factorId, challengeId: ch.id, code })
      if (ve) throw ve
      setFactors([...factors, { id: factorId, status: 'verified' }])
      setStep('idle'); setCode(''); setQr(''); setSecret('')
    } catch (e: any) {
      setErr(e?.message ?? 'الكود غلط')
    }
    setLoading(false)
  }

  async function unenroll(id: string) {
    if (!confirm('تأكيد إلغاء الـ 2FA؟')) return
    setLoading(true)
    try {
      const sb = createClient()
      await (sb.auth as any).mfa.unenroll({ factorId: id })
      setFactors(factors.filter((f) => f.id !== id))
    } catch {}
    setLoading(false)
  }

  if (step === 'idle') {
    return (
      <div className="sec-card">
        <h2 className="sec-title">التحقق بخطوتين</h2>
        <p className="sec-sub">حماية حسابك بـ Authenticator (Google / Authy / 1Password)</p>
        {factors.length > 0 ? (
          <ul className="sec-factors">
            {factors.map((f) => (
              <li key={f.id} className="sec-factor">
                <span>{f.friendly_name ?? 'Authenticator'}</span>
                <button className="sec-btn sec-btn--danger" onClick={() => unenroll(f.id)} disabled={loading}>إلغاء</button>
              </li>
            ))}
          </ul>
        ) : (
          <button className="sec-btn sec-btn--primary" onClick={start} disabled={loading}>
            {loading ? '...' : 'تفعيل 2FA'}
          </button>
        )}
        {err && <p className="sec-err">{err}</p>}
      </div>
    )
  }

  return (
    <div className="sec-card">
      <h2 className="sec-title">امسح الكود</h2>
      {qr && <img src={qr} alt="QR" className="sec-qr" />}
      {secret && (
        <div className="sec-secret">
          <span>أو ادخل يدوي:</span>
          <code>{secret}</code>
        </div>
      )}
      <input
        className="sec-input"
        type="text"
        inputMode="numeric"
        placeholder="الكود 6 أرقام"
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
      />
      <button className="sec-btn sec-btn--primary" onClick={verify} disabled={loading || code.length !== 6}>
        {loading ? '...' : 'تحقق'}
      </button>
      {err && <p className="sec-err">{err}</p>}
    </div>
  )
}
