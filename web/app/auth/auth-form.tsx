'use client'

import { useActionState, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Logo from '@/components/logo'
import AreaDropdown from '@/components/area-dropdown'
import {
  EyeIcon,
  EyeOffIcon,
  PhoneIcon,
  LockIcon,
  UserIcon,
  MaleIcon,
  FemaleIcon,
  MapPinIcon,
  NavigationIcon,
  CheckCircleIcon,
} from '@/components/icons'
import { Turnstile } from '@marsidev/react-turnstile'
import { signupAction, loginAction, type AuthResult } from './actions'
import styles from './auth.module.css'

// Test Keys من Cloudflare — تبدأ بـ 1x000
// Site Key عام (بيظهر في HTML لأي زائر) — hardcoded لضمان عدم الاعتماد على env vars
const TURNSTILE_SITE_KEY = '0x4AAAAAAFKj0MmPWv_YfMRl'
const IS_TEST_KEY = false

type Tab = 'login' | 'signup'
type Gender = 'male' | 'female' | null

type FormState = AuthResult | null

async function formAction(_prev: FormState, formData: FormData): Promise<AuthResult> {
  const mode = formData.get('_mode')
  if (mode === 'signup') return signupAction(formData)
  return loginAction(formData)
}

export default function AuthForm({ nonce }: { nonce: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const refCode = searchParams.get('ref') ?? ''
  const [tab, setTab] = useState<Tab>(refCode || searchParams.get('mode') === 'signup' ? 'signup' : 'login')
  const [gender, setGender] = useState<Gender>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [area, setArea] = useState('')
  const [address, setAddress] = useState('')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsError, setGpsError] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [turnstileKey, setTurnstileKey] = useState(0)

  const [state, dispatch, isPending] = useActionState(formAction, null)

  useEffect(() => {
    if (state && state.ok && state.redirect) {
      router.push(state.redirect)
      router.refresh()
      return
    }
    // reset Turnstile بعد أي فشل (الـ token بيستخدم مرة واحدة بس)
    // ده sync مشروع بين نتيجة الـ server action والـ external widget
    if (state && !state.ok) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync with external Turnstile widget after action failure
      setTurnstileToken(null)
      setTurnstileKey((k) => k + 1)
    }
  }, [state, router])

  const errorMsg = state && !state.ok ? state.error : null

  const switchTab = (next: Tab) => {
    if (next === tab) return
    setTab(next)
    setGender(null)
    setShowPassword(false)
    setShowConfirm(false)
    setTurnstileToken(null)
    setTurnstileKey((k) => k + 1)
  }

  const handleGPS = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGpsError('متصفحك مش بيدعم تحديد الموقع')
      return
    }

    setGpsLoading(true)
    setGpsError(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })
        setGpsLoading(false)
      },
      () => {
        setGpsError('مش قادرين نجيب موقعك — تأكد من الإذن')
        setGpsLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Logo size="md" />
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
          {refCode && <input type="hidden" name="referral_code" value={refCode} />}

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
                  </button>
                </div>
                <input type="hidden" name="gender" value={gender ?? ''} />
              </div>
            </>
          )}

          {tab === 'signup' && (
            <div className={styles.locationSection}>
              <div className={styles.sectionTitle}>
                <MapPinIcon size={16} />
                <span>عنوانك الافتراضي</span>
                <span className={styles.optionalTag}>اختياري</span>
              </div>
              <p className={styles.sectionHint}>عشان نعرضلك الأماكن القريبة منك</p>

              <div className={styles.field}>
                <label className={styles.label}>المنطقة</label>
                <AreaDropdown value={area} onChange={setArea} disabled={isPending} />
                <input type="hidden" name="default_area" value={area} />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="default_address">
                  العنوان التفصيلي
                </label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>
                    <NavigationIcon size={18} />
                  </span>
                  <input
                    id="default_address"
                    name="default_address"
                    type="text"
                    className={styles.input}
                    placeholder="الشارع، رقم العمارة، الدور"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={isPending}
                    maxLength={200}
                  />
                </div>
              </div>

              <div className={styles.gpsRow}>
                {coords ? (
                  <span className={styles.gpsSuccess}>
                    <CheckCircleIcon size={16} />
                    <span>تم تحديد موقعك</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    className={styles.gpsBtn}
                    onClick={handleGPS}
                    disabled={gpsLoading || isPending}
                  >
                    <NavigationIcon size={16} />
                    <span>{gpsLoading ? 'جاري التحديد...' : 'استخدم موقعي الحالي'}</span>
                  </button>
                )}
                {gpsError && <span className={styles.gpsError}>{gpsError}</span>}
              </div>

              {/* Hidden inputs للـ coords */}
              <input type="hidden" name="default_latitude" value={coords?.lat ?? ''} />
              <input type="hidden" name="default_longitude" value={coords?.lng ?? ''} />
            </div>
          )}

          {tab === 'signup' && !IS_TEST_KEY && (
            <div className={styles.turnstileWrap}>
              <Turnstile
                key={turnstileKey}
                siteKey={TURNSTILE_SITE_KEY}
                scriptOptions={{ nonce }}
                onSuccess={(token) => setTurnstileToken(token)}
                onError={() => setTurnstileToken(null)}
                onExpire={() => setTurnstileToken(null)}
                options={{ theme: 'dark', size: 'flexible' }}
              />
              {!turnstileToken && !isPending && (
                <p className={styles.turnstileHint}>أكمل التحقق الأمني من فضلك</p>
              )}
            </div>
          )}

          <button
            type="submit"
            className={styles.submit}
            disabled={isPending || (tab === 'signup' && !IS_TEST_KEY && !turnstileToken)}
          >
            <span>{isPending ? '...' : tab === 'login' ? 'دخول' : 'سجّل'}</span>
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
