'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheckIcon, CheckCircleIcon, LockIcon } from '@/components/icons'
import { setupTwoFactor, verifyTwoFactor, disableTwoFactor } from '@/lib/actions/two-factor'
import type { TwoFactorState } from '@/lib/data/two-factor'
import styles from './two-factor-section.module.css'

type Phase = 'idle' | 'setup' | 'verify-success' | 'disabling'
type Props = { state: TwoFactorState }

export function TwoFactorSection({ state }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [phase, setPhase] = useState<Phase>('idle')
  const [qr, setQr] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSetup = () => {
    setError(null)
    startTransition(async () => {
      const res = await setupTwoFactor()
      if (res.ok) {
        setQr(res.qr)
        setSecret(res.secret)
        setPhase('setup')
      } else {
        setError(res.error)
      }
    })
  }

  const handleVerify = () => {
    setError(null)
    startTransition(async () => {
      const res = await verifyTwoFactor(code)
      if (res.ok) {
        setBackupCodes(res.backup_codes)
        setPhase('verify-success')
        router.refresh()
      } else {
        setError(res.error)
      }
    })
  }

  const handleDisable = () => {
    setError(null)
    startTransition(async () => {
      const res = await disableTwoFactor(code)
      if (res.ok) {
        setPhase('idle')
        setCode('')
        router.refresh()
      } else {
        setError(res.error)
      }
    })
  }

  const finishSetup = () => {
    setPhase('idle')
    setQr(null)
    setSecret(null)
    setCode('')
    setBackupCodes(null)
  }

  if (phase === 'setup' && qr && secret) {
    return (
      <SetupView
        qr={qr}
        secret={secret}
        code={code}
        setCode={setCode}
        error={error}
        pending={pending}
        onVerify={handleVerify}
        onCancel={finishSetup}
      />
    )
  }

  if (phase === 'verify-success' && backupCodes) {
    return <SuccessView backupCodes={backupCodes} onFinish={finishSetup} />
  }

  return (
    <SectionShell state={state} phase={phase}>
      {state.enabled ? (
        <EnabledView
          state={state}
          code={code}
          setCode={setCode}
          error={error}
          pending={pending}
          phase={phase}
          onDisableClick={() => setPhase('disabling')}
          onCancelDisable={() => {
            setPhase('idle')
            setCode('')
            setError(null)
          }}
          onDisable={handleDisable}
        />
      ) : (
        <DisabledView pending={pending} error={error} onSetup={handleSetup} />
      )}
    </SectionShell>
  )
}

function SectionShell({
  state,
  phase,
  children,
}: {
  state: TwoFactorState
  phase: Phase
  children: React.ReactNode
}) {
  const subtitle = state.enabled
    ? 'مفعّلة — حسابك محمي'
    : phase === 'disabling'
      ? 'أدخل الكود الحالي لإلغاء التفعيل'
      : 'حماية إضافية بكود من جوالك — مجانية 100%'
  return (
    <div className={styles.card}>
      <header className={styles.header}>
        <span className={styles.icon}>
          <ShieldCheckIcon size={18} />
        </span>
        <div>
          <h3 className={styles.title}>المصادقة الثنائية (2FA)</h3>
          <p className={styles.desc}>{subtitle}</p>
        </div>
      </header>
      {children}
    </div>
  )
}

function DisabledView({
  pending,
  error,
  onSetup,
}: {
  pending: boolean
  error: string | null
  onSetup: () => void
}) {
  return (
    <>
      <p className={styles.helper}>
        عند التفعيل، ستحتاج كود 6 أرقام من تطبيق <strong>Google Authenticator</strong> أو{' '}
        <strong>Authy</strong> عند كل تسجيل دخول.
      </p>
      {error && <p className={styles.error}>{error}</p>}
      <button type="button" className={styles.primaryBtn} onClick={onSetup} disabled={pending}>
        {pending ? 'جاري التحضير…' : 'تفعيل 2FA'}
      </button>
    </>
  )
}

function EnabledView({
  state,
  code,
  setCode,
  error,
  pending,
  phase,
  onDisableClick,
  onCancelDisable,
  onDisable,
}: {
  state: TwoFactorState
  code: string
  setCode: (s: string) => void
  error: string | null
  pending: boolean
  phase: Phase
  onDisableClick: () => void
  onCancelDisable: () => void
  onDisable: () => void
}) {
  if (!state.enabled) return null
  const enabledDate = new Date(state.enabled_at).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  if (phase === 'disabling') {
    return (
      <>
        <div className={styles.codeRow}>
          <input
            type="text"
            inputMode="numeric"
            dir="ltr"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            className={styles.codeInput}
            aria-label="كود 2FA"
          />
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.actions}>
          <button type="button" className={styles.dangerBtn} onClick={onDisable} disabled={pending}>
            {pending ? '...' : 'تأكيد الإلغاء'}
          </button>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={onCancelDisable}
            disabled={pending}
          >
            رجوع
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <div className={styles.statusRow}>
        <span className={styles.badgeSuccess}>
          <CheckCircleIcon size={12} /> مفعّل
        </span>
        <span className={styles.statusMeta}>منذ {enabledDate}</span>
        <span className={styles.statusMeta}>
          Backup codes متبقية: {state.backup_codes_remaining}
        </span>
      </div>
      <button type="button" className={styles.dangerBtn} onClick={onDisableClick}>
        إلغاء التفعيل
      </button>
    </>
  )
}

function SetupView({
  qr,
  secret,
  code,
  setCode,
  error,
  pending,
  onVerify,
  onCancel,
}: {
  qr: string
  secret: string
  code: string
  setCode: (s: string) => void
  error: string | null
  pending: boolean
  onVerify: () => void
  onCancel: () => void
}) {
  return (
    <div className={styles.card}>
      <header className={styles.header}>
        <span className={styles.icon}>
          <LockIcon size={18} />
        </span>
        <div>
          <h3 className={styles.title}>تفعيل 2FA — الخطوة 1 من 2</h3>
          <p className={styles.desc}>امسح الكود بتطبيق Google Authenticator</p>
        </div>
      </header>

      <div className={styles.qrWrap}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qr} alt="QR code" className={styles.qr} />
      </div>

      <p className={styles.helper}>أو أدخل الكود يدويًا:</p>
      <code className={styles.secret} dir="ltr">
        {secret}
      </code>

      <div className={styles.codeRow}>
        <input
          type="text"
          inputMode="numeric"
          dir="ltr"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          className={styles.codeInput}
          aria-label="كود التحقق"
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={onVerify}
          disabled={pending || code.length !== 6}
        >
          {pending ? 'جاري التحقق…' : 'تأكيد التفعيل'}
        </button>
        <button type="button" className={styles.secondaryBtn} onClick={onCancel} disabled={pending}>
          إلغاء
        </button>
      </div>
    </div>
  )
}

function SuccessView({ backupCodes, onFinish }: { backupCodes: string[]; onFinish: () => void }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(backupCodes.join('\n'))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard قد لا يعمل — نطلب من المستخدم نسخ يدويًا
    }
  }

  return (
    <div className={styles.card}>
      <header className={styles.header}>
        <span className={styles.iconSuccess}>
          <CheckCircleIcon size={18} />
        </span>
        <div>
          <h3 className={styles.title}>تم تفعيل 2FA بنجاح</h3>
          <p className={styles.desc}>احفظ Backup Codes في مكان آمن — لن تظهر مرة أخرى</p>
        </div>
      </header>

      <div className={styles.backupGrid} dir="ltr">
        {backupCodes.map((c) => (
          <code key={c} className={styles.backupCode}>
            {c}
          </code>
        ))}
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.secondaryBtn} onClick={handleCopy}>
          {copied ? '✓ تم النسخ' : 'نسخ الكل'}
        </button>
        <button type="button" className={styles.primaryBtn} onClick={onFinish}>
          حفظتها — إنهاء
        </button>
      </div>
    </div>
  )
}
