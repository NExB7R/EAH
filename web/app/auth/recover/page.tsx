'use client'

import { useActionState } from 'react'
import { recoverAction, type AuthResult } from '../actions'
import styles from '../auth.module.css'

async function formAction(_prev: AuthResult | null, formData: FormData): Promise<AuthResult> {
  return recoverAction(formData)
}

export default function RecoverPage() {
  const [state, dispatch, isPending] = useActionState(formAction, null)

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>EAH</div>
          <div className={styles.tagline}>استرجاع كلمة السر</div>
        </div>

        {state?.ok ? (
          <div className={styles.field}>
            <p style={{ textAlign: 'center', color: 'var(--teal)' }}>
              تم استلام طلبك — هنتواصل معاك قريب.
            </p>
            <a
              href="/auth"
              className={styles.link}
              style={{ display: 'block', textAlign: 'center', marginTop: 'var(--space-4)' }}
            >
              رجوع للدخول
            </a>
          </div>
        ) : (
          <form action={dispatch} className={styles.form}>
            {state && !state.ok && <div className={styles.error}>{state.error}</div>}

            <div className={styles.field}>
              <label className={styles.label} htmlFor="phone">
                رقم الموبايل
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                className={styles.input}
                placeholder="01xxxxxxxxx"
                disabled={isPending}
                required
              />
            </div>

            <button type="submit" className={styles.submit} disabled={isPending}>
              {isPending ? '...' : 'ابعت الطلب'}
            </button>
          </form>
        )}

        {!state?.ok && (
          <div className={styles.links}>
            <a href="/auth" className={styles.link}>
              رجوع للدخول
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
