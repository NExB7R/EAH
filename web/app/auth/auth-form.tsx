'use client'

import { useActionState, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/logo'
import { LocationIcon } from '@/components/icons'
import {
  EyeIcon,
  EyeOffIcon,
  PhoneIcon,
  LockIcon,
  UserIcon,
  MaleIcon,
  FemaleIcon,
  CheckIcon,
} from '@/components/icons'
import { signupAction, loginAction, type AuthResult } from './actions'
import styles from './auth.module.css'

type Tab = 'login' | 'signup'
type Gender = 'male' | 'female' | null

type FormState = AuthResult | null

async function formAction(
  _prev: FormState,
  formData: FormData
): Promise<AuthResult> {
  const mode = formData.get('_mode')
  if (mode === 'signup') return signupAction(formData)
  return loginAction(formData)
}

// هوكات تسجيل الدخول — للعملاء
const CUSTOMER_HOOKS = [
  {
    title: 'اكتشف أحسن الأماكن حواليك',
    desc: 'مطاعم، كافيهات، صيدليات، وكل حاجة في شبين القناطر',
  },
  {
    title: 'اطلب على واتساب مباشرة',
    desc: 'من غير وسيط، ومن غير عمولة — كلمهم علطول',
  },
  {
    title: 'اكسب نقاط ووفّر فلوس',
    desc: 'مع كل طلب وتقييم — استبدلهم بعروض وكوبونات',
  },
]

// هوكات التسجيل — لأصحاب الأنشطة
const MERCHANT_HOOKS = [
  {
    title: 'سجّل نشاطك مجاناً',
    desc: 'صفحة كاملة، وطلبات على واتساب، بدون عمولة خالص',
  },
  {
    title: 'اعرف عملاءك وأرقامك',
    desc: 'إحصائيات دقيقة، ومتابعين، وتقارير شهرية',
  },
  {
    title: 'اظهر في المميزين',
    desc: 'وصول أكتر لعملاء جدد حوالين نشاطك، من غير ما تدفع',
  },
]

export default function AuthForm() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('login')
  const [gender, setGender] = useState<Gender>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [hooksMode, setHooksMode] = useState<'customer' | 'merchant'>('customer')

  const [state, dispatch, isPending] = useActionState(formAction, null)

  useEffect(() => {
    if (state && state.ok && state.redirect) {
      router.push(state.redirect)
      router.refresh()
    }
  }, [state, router])

  const errorMsg = state && !state.ok ? state.error : null

  const switchTab = (next: Tab) => {
    if (next === tab) return
    setTab(next)
    setGender(null)
    setShowPassword(false)
    setShowConfirm(false)
  }

  const hooks = hooksMode === 'customer' ? CUSTOMER_HOOKS : MERCHANT_HOOKS

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Logo size="md" />
        </div>

        <div className={styles.subtitle}>
          <span className={styles.subtitleIcon}>
            <LocationIcon size={14} />
          </span>
          <span>دولة شبين القناطر تتحدث</span>
        </div>
        <div className={styles.subtitleHint}>
          {tab === 'login'
            ? 'رقم + كلمة سر، وخلاص'
            : '3 حقول، ثانية واحدة، وتبدأ'}
        </div>

        <div className={styles.tabs}>
          <div
            className={`${styles.tabIndicator} ${
              tab === 'login' ? styles.tabIndicatorLeft : styles.tabIndicatorRight
            }`}
            aria-hidden
          />
          <button
            type="button"
            className={`${styles.tab} ${tab === 'login' ? styles.tabActive : ''}`}
            onClick={() => switchTab('login')}
          >
            دخول سريع
          </button>
          <button
            type="button"
            className={`${styles.tab} ${tab === 'signup' ? styles.tabActive : ''}`}
            onClick={() => switchTab('signup')}
          >
            تسجيل سريع
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
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}>
                  <UserIcon size={18} />
                </span>
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
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="phone">
              رقم الموبايل
            </label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>
                <PhoneIcon size={18} />
              </span>
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                className={styles.input}
                placeholder="01xxxxxxxxx"
                disabled={isPending}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              كلمة السر
            </label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>
                <LockIcon size={18} />
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                className={styles.input}
                placeholder="8 حروف على الأقل"
                disabled={isPending}
                required
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                disabled={isPending}
                aria-label={showPassword ? 'إخفاء كلمة السر' : 'إظهار كلمة السر'}
              >
                {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>
          </div>

          {tab === 'signup' && (
            <>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="confirm_password">
                  تأكيد كلمة السر
                </label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>
                    <LockIcon size={18} />
                  </span>
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={styles.input}
                    placeholder="أعد كتابة كلمة السر"
                    disabled={isPending}
                    required
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowConfirm(!showConfirm)}
                    disabled={isPending}
                    aria-label={showConfirm ? 'إخفاء كلمة السر' : 'إظهار كلمة السر'}
                  >
                    {showConfirm ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                  </button>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>النوع (اختياري)</label>
                <div className={styles.gender}>
                  <button
                    type="button"
                    className={`${styles.genderOption} ${
                      gender === 'male' ? styles.genderOptionActive : ''
                    }`}
                    onClick={() => setGender(gender === 'male' ? null : 'male')}
                    disabled={isPending}
                  >
                    <span className={styles.genderIconWrap}>
                      <MaleIcon size={20} />
                    </span>
                    راجل
                  </button>
                  <button
                    type="button"
                    className={`${styles.genderOption} ${
                      gender === 'female' ? styles.genderOptionActive : ''
                    }`}
                    onClick={() => setGender(gender === 'female' ? null : 'female')}
                    disabled={isPending}
                  >
                    <span className={styles.genderIconWrap}>
                      <FemaleIcon size={20} />
                    </span>
                    ست
                  </button>
                </div>
                <input type="hidden" name="gender" value={gender ?? ''} />
              </div>
            </>
          )}

          <button type="submit" className={styles.submit} disabled={isPending}>
            <span>{isPending ? '...' : tab === 'login' ? 'دخول' : 'سجّل'}</span>
          </button>
        </form>

        <div className={styles.links}>
          <a href="/auth/recover" className={styles.link}>
            نسيت كلمة السر؟
          </a>
        </div>

        <div className={styles.hooks}>
          <div className={styles.hooksTitle}>ليه EAH؟</div>

          <div className={styles.tabs} style={{ marginBottom: 'var(--space-4)' }}>
            <button
              type="button"
              className={`${styles.tab} ${
                hooksMode === 'customer' ? styles.tabActive : ''
              }`}
              onClick={() => setHooksMode('customer')}
            >
              للعملاء
            </button>
            <button
              type="button"
              className={`${styles.tab} ${
                hooksMode === 'merchant' ? styles.tabActive : ''
              }`}
              onClick={() => setHooksMode('merchant')}
            >
              لأصحاب الأنشطة
            </button>
          </div>

          <div className={styles.hooksList}>
            {hooks.map((hook) => (
              <div key={hook.title} className={styles.hook}>
                <span className={styles.hookIcon}>
                  <CheckIcon size={16} />
                </span>
                <div className={styles.hookText}>
                  <div className={styles.hookTitle}>{hook.title}</div>
                  <div className={styles.hookDesc}>{hook.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
