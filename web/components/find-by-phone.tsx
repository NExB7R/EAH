'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Turnstile } from '@marsidev/react-turnstile'
import { SearchIcon, PhoneIcon, ShieldCheckIcon, StarIcon, AlertIcon } from './icons'
import { getTrustTierMeta } from '@/lib/trust'
import styles from './find-by-phone.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Find by Phone (Truecaller Style)
// ═══════════════════════════════════════════════════════════

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '0x4AAAAAAFKj0MmPWv_YfMRl'

type UserResult = {
  display_name: string
  alias: string | null
  avatar_url: string | null
  trust_score: number
  trust_tier: string
  legend_points: number
  is_premium: boolean
  is_business: boolean
  business_slug: string | null
  business_name: string | null
}

type State =
  | { type: 'idle' }
  | { type: 'loading' }
  | { type: 'found'; user: UserResult }
  | { type: 'not-found'; message: string }
  | { type: 'error'; message: string }

export default function FindByPhone() {
  const [phone, setPhone] = useState('')
  const [state, setState] = useState<State>({ type: 'idle' })
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [turnstileKey, setTurnstileKey] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!turnstileToken) {
      setState({ type: 'error', message: 'أكمل التحقق الأمني من فضلك' })
      return
    }

    setState({ type: 'loading' })

    try {
      const res = await fetch('/api/find-by-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), turnstileToken }),
      })

      const data = await res.json()

      if (!res.ok) {
        setState({ type: 'error', message: data.error ?? 'حصل خطأ' })
        return
      }

      if (!data.found) {
        setState({ type: 'not-found', message: data.message ?? 'الرقم مش مسجل' })
        return
      }

      setState({ type: 'found', user: data.user })
    } catch {
      setState({ type: 'error', message: 'مش قادرين نبحث دلوقتي' })
    } finally {
      setTurnstileToken(null)
      setTurnstileKey((current) => current + 1)
    }
  }

  return (
    <div className={styles.wrap}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputWrap}>
          <span className={styles.inputIcon}>
            <PhoneIcon size={18} />
          </span>
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="01XXXXXXXXX"
            maxLength={11}
            className={styles.input}
            dir="ltr"
            autoComplete="tel"
          />
          <button
            type="submit"
            className={styles.submit}
            disabled={state.type === 'loading' || phone.length !== 11 || !turnstileToken}
          >
            {state.type === 'loading' ? (
              <span className={styles.spinner} />
            ) : (
              <SearchIcon size={18} />
            )}
          </button>
        </div>
        <p className={styles.hint}>الرقم الكامل (11 رقم) — يبدأ بـ 010/011/012/015</p>
        <div className={styles.turnstile}>
          <Turnstile
            key={turnstileKey}
            siteKey={TURNSTILE_SITE_KEY}
            onSuccess={(token) => setTurnstileToken(token)}
            onError={() => setTurnstileToken(null)}
            onExpire={() => setTurnstileToken(null)}
            options={{ theme: 'dark', size: 'flexible' }}
          />
          {!turnstileToken && <p className={styles.hint}>أكمل التحقق الأمني قبل البحث</p>}
        </div>
      </form>

      {state.type === 'error' && (
        <div className={`${styles.result} ${styles.error}`}>
          <AlertIcon size={20} />
          <p>{state.message}</p>
        </div>
      )}

      {state.type === 'not-found' && (
        <div className={styles.result}>
          <AlertIcon size={20} />
          <p>{state.message}</p>
        </div>
      )}

      {state.type === 'found' && (
        <div className={styles.userCard}>
          <div className={styles.userHeader}>
            {state.user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={state.user.avatar_url}
                alt={state.user.display_name}
                className={styles.avatar}
              />
            ) : (
              <div className={styles.avatarFallback}>{state.user.display_name.charAt(0)}</div>
            )}

            <div className={styles.userInfo}>
              <h3 className={styles.userName}>
                {state.user.alias ?? state.user.display_name}
                {state.user.is_premium && <span className={styles.premium}>⭐</span>}
              </h3>
              <div className={styles.userMeta}>
                <span className={styles.levelBadge}>
                  {getTrustTierMeta(state.user.trust_score).emoji}{' '}
                  {getTrustTierMeta(state.user.trust_score).label}
                </span>
                {state.user.trust_tier === 'harif' && (
                  <span className={styles.verified}>
                    <ShieldCheckIcon size={12} />
                    كبير
                  </span>
                )}
                {state.user.trust_tier === 'ostora' && (
                  <span className={styles.verified}>
                    <ShieldCheckIcon size={12} />
                    أسطورة
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>
                <StarIcon size={14} />
                {state.user.trust_score}
              </span>
              <span className={styles.statLabel}>المصداقية</span>
            </div>
            {state.user.legend_points > 0 && (
              <div className={styles.stat}>
                <span className={styles.statValue}>👑 {state.user.legend_points}</span>
                <span className={styles.statLabel}>نقاط أسطورة</span>
              </div>
            )}
          </div>

          {state.user.is_business && state.user.business_slug && (
            <Link href={`/businesses/${state.user.business_slug}`} className={styles.businessBtn}>
              <span>شوف نشاطه: {state.user.business_name}</span>
              <span>→</span>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
