'use client'

import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import {
  signupAction,
  loginAction,
  type AuthResult,
} from './actions'
import styles from './auth.module.css'

type Tab = 'login' | 'signup'

type FormState = AuthResult | null

async function formAction(
  _prev: FormState,
  formData: FormData
): Promise<AuthResult> {
  const mode = formData.get('_mode')
  if (mode === 'signup') return signupAction(formData)
  return loginAction(formData)
}
export default function AuthForm() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('login')
  const [gender, setGender] = useState<'male' | 'female' | null>(null)

  const [state, dispatch, isPending] = useActionState(formAction, null)

  // Redirect بعد النجاح
  useEffect(() => {
    if (state && state.ok && state.redirect) {
      router.push(state.redirect)
      router.refresh()
    }
  }, [state, router])

  const errorMsg = state && !state.ok ? state.error : null
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>EAH</div>
          <div className={styles.tagline}>اللي نفسك فيه ؟</div>
        </div>

        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${tab === 'login' ? styles.tabActive : ''}`}
            onClick={() => setTab('login')}
          >
            دخول
          </button>
          <button
            type="button"
            className={`${styles.tab} ${tab === 'signup' ? styles.tabActive : ''}`}
            onClick={() => setTab('signup')}
          >
            حساب جديد
          </button>
        </div>

        <form action={dispatch} className={styles.form}>
          <input type="hidden" name="_mode" value={tab} />

          {errorMsg && <div className={styles.error}>{errorMsg}</div>}

          {tab === 'signup' && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="display_name">
                الاسم
              </label>
              <input
                id="display_name"
                name="display_name"
                type="text"
                className={styles.input}
                placeholder="مثال: نور الدين"
                disabled={isPending}
                required
              />
            </div>
          )}

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

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              كلمة السر
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className={styles.input}
              placeholder="8 حروف على الأقل"
              disabled={isPending}
              required
            />
          </div>

          {tab === 'signup' && (
            <>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="confirm_password">
                  تأكيد كلمة السر
                </label>
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  className={styles.input}
                  placeholder="أعد كتابة كلمة السر"
                  disabled={isPending}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>النوع (اختياري)</label>
                <div className={styles.gender}>
                  <button
                    type="button"
                    className={`${styles.genderOption} ${gender === 'male' ? styles.genderOptionActive : ''}`}
                    onClick={() => setGender(gender === 'male' ? null : 'male')}
                    disabled={isPending}
                  >
                    راجل
                  </button>
                  <button
                    type="button"
                    className={`${styles.genderOption} ${gender === 'female' ? styles.genderOptionActive : ''}`}
                    onClick={() => setGender(gender === 'female' ? null : 'female')}
                    disabled={isPending}
                  >
                    ست
                  </button>
                </div>
                <input type="hidden" name="gender" value={gender ?? ''} />
              </div>
            </>
          )}

          <button
            type="submit"
            className={styles.submit}
            disabled={isPending}
          >
            {isPending ? '...' : tab === 'login' ? 'دخول' : 'سجّل'}
          </button>
        </form>

        <div className={styles.links}>
          <a href="/auth/recover" className={styles.link}>
            نسيت كلمة السر؟
          </a>
        </div>
      </div>
    </div>
  )
}
