'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  StoreIcon,
  PhoneIcon,
  MapPinIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  UtensilsIcon,
  PillIcon,
  CartIcon,
  BikeIcon,
  SparklesIcon,
} from '@/components/icons'
import { submitMerchantApplication } from '../actions'
import styles from './apply-wizard.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Seller activity application wizard (4 steps)
// ═══════════════════════════════════════════════════════════

type Props = {
  areas: readonly string[]
}

type BusinessType = 'restaurant' | 'pharmacy' | 'supermarket' | 'delivery_office' | 'misc'

const STEPS = [
  { key: 'basic', label: 'الأساسيات', Icon: StoreIcon },
  { key: 'contact', label: 'التواصل', Icon: PhoneIcon },
  { key: 'location', label: 'الموقع', Icon: MapPinIcon },
  { key: 'confirm', label: 'مراجعة الطلب', Icon: CheckCircleIcon },
] as const

const TYPES: Array<{ value: BusinessType; label: string; Icon: typeof UtensilsIcon }> = [
  { value: 'restaurant', label: 'مطعم', Icon: UtensilsIcon },
  { value: 'pharmacy', label: 'صيدلية', Icon: PillIcon },
  { value: 'supermarket', label: 'ماركت', Icon: CartIcon },
  { value: 'delivery_office', label: 'توصيل', Icon: BikeIcon },
  { value: 'misc', label: 'أنشطة أخرى', Icon: SparklesIcon },
]

export default function ApplyWizard({ areas }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // form state
  const [name, setName] = useState('')
  const [businessType, setBusinessType] = useState<BusinessType>('restaurant')
  const [customBusinessType, setCustomBusinessType] = useState('')
  const [area, setArea] = useState('')
  const [description, setDescription] = useState('')
  const [hook, setHook] = useState('')

  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [facebook, setFacebook] = useState('')
  const [instagram, setInstagram] = useState('')

  const [addressText, setAddressText] = useState('')
  const [lat, setLat] = useState<string>('')
  const [lng, setLng] = useState<string>('')

  const [agree, setAgree] = useState(false)

  const canNext = (): boolean => {
    if (step === 0) {
      const customTypeValid = businessType !== 'misc' || customBusinessType.trim().length >= 2
      return (
        name.trim().length >= 2 &&
        area.length > 0 &&
        description.trim().length >= 10 &&
        customTypeValid
      )
    }
    if (step === 1) {
      return /^01[0125][0-9]{8}$/.test(phone.trim())
    }
    if (step === 2) {
      return addressText.trim().length >= 5
    }
    if (step === 3) {
      return agree
    }
    return false
  }

  const handleNext = () => {
    setError(null)
    if (!canNext()) {
      setError('لسه في بيانات ناقصة')
      return
    }
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
    }
  }

  const handleBack = () => {
    setError(null)
    if (step > 0) setStep((s) => s - 1)
  }

  const handleSubmit = () => {
    setError(null)
    if (!canNext()) {
      setError('وافق على الشروط الأول')
      return
    }

    const fd = new FormData()
    fd.set('name', name)
    fd.set('business_type', businessType)
    fd.set('custom_business_type', businessType === 'misc' ? customBusinessType.trim() : '')
    fd.set('area', area)
    fd.set('city', 'شبين القناطر')
    fd.set('description', description)
    fd.set('hook', hook)
    fd.set('phone', phone)
    fd.set('whatsapp', whatsapp)
    fd.set('facebook', facebook)
    fd.set('instagram', instagram)
    fd.set('address_text', addressText)
    fd.set('latitude', lat)
    fd.set('longitude', lng)
    fd.set('agree_terms', 'true')

    startTransition(async () => {
      const result = await submitMerchantApplication(fd)
      if (result.ok) {
        router.push('/merchant/apply/success')
      } else {
        setError(result.error)
      }
    })
  }

  const handleGetLocation = () => {
    if (!('geolocation' in navigator)) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6))
        setLng(pos.coords.longitude.toFixed(6))
      },
      () => {
        // رفض — نتجاهل
      },
      { timeout: 8000 },
    )
  }

  return (
    <div className={styles.wrap}>
      {/* Progress */}
      <ol className={styles.progress}>
        {STEPS.map(({ key, label, Icon }, i) => (
          <li
            key={key}
            className={`${styles.progressItem} ${i === step ? styles.active : ''} ${i < step ? styles.done : ''}`}
          >
            <span className={styles.progressIcon}>
              {i < step ? <CheckCircleIcon size={16} /> : <Icon size={16} />}
            </span>
            <span className={styles.progressLabel}>{label}</span>
          </li>
        ))}
      </ol>

      {/* Body */}
      <div className={styles.body}>
        {step === 0 && (
          <>
            <h2 className={styles.stepTitle}>الأساسيات</h2>
            <p className={styles.stepDesc}>اسم النشاط ونوعه والوصف</p>

            <label className={styles.field}>
              <span className={styles.label}>اسم النشاط *</span>
              <input
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: كشري التحرير — شبين"
                maxLength={80}
              />
            </label>

            <div className={styles.field}>
              <span className={styles.label}>نوع النشاط *</span>
              <div className={styles.typesGrid}>
                {TYPES.map(({ value, label, Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setBusinessType(value)}
                    className={`${styles.typeBtn} ${businessType === value ? styles.typeActive : ''}`}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {businessType === 'misc' && (
              <label className={styles.field}>
                <span className={styles.label}>نوع النشاط بالتحديد * (حرفين على الأقل)</span>
                <input
                  className={styles.input}
                  value={customBusinessType}
                  onChange={(e) => setCustomBusinessType(e.target.value.slice(0, 50))}
                  placeholder="مثال: مغسلة ملابس، حلاق، ورشة..."
                  maxLength={50}
                  aria-invalid={customBusinessType.trim().length > 0 && customBusinessType.trim().length < 2}
                />
                <span className={styles.fieldHint}>
                  لحد ما الأدمن يعتمد الاسم، النوع هيظهر للزوار تحت «أخرى».
                </span>
              </label>
            )}

            <label className={styles.field}>
              <span className={styles.label}>المنطقة *</span>
              <select
                className={styles.select}
                value={area}
                onChange={(e) => setArea(e.target.value)}
              >
                <option value="">اختر المنطقة</option>
                {areas.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.label}>الوصف * (10 حروف على الأقل)</span>
              <textarea
                className={styles.textarea}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="اكتب عن النشاط — إيه اللي بيقدمه، وإيه اللي يميزه..."
                maxLength={500}
                rows={4}
              />
              <span className={styles.counter}>{description.length} / 500</span>
            </label>

            <label className={styles.field}>
              <span className={styles.label}>جملة قصيرة (اختياري)</span>
              <input
                className={styles.input}
                value={hook}
                onChange={(e) => setHook(e.target.value)}
                placeholder="مثال: أشهى كشري في شبين"
                maxLength={100}
              />
            </label>
          </>
        )}

        {step === 1 && (
          <>
            <h2 className={styles.stepTitle}>التواصل</h2>
            <p className={styles.stepDesc}>عشان المشتري يوصلك بسهولة</p>

            <label className={styles.field}>
              <span className={styles.label}>رقم الموبايل * (11 رقم)</span>
              <input
                className={styles.input}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01xxxxxxxxx"
                inputMode="tel"
                maxLength={11}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>رقم الواتساب (لو مختلف)</span>
              <input
                className={styles.input}
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="01xxxxxxxxx"
                inputMode="tel"
                maxLength={11}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>صفحة فيسبوك (اختياري)</span>
              <input
                className={styles.input}
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="https://facebook.com/..."
                dir="ltr"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>إنستجرام (اختياري)</span>
              <input
                className={styles.input}
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://instagram.com/..."
                dir="ltr"
              />
            </label>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className={styles.stepTitle}>الموقع</h2>
            <p className={styles.stepDesc}>عشان العملاء يلاقوك بسهولة</p>

            <label className={styles.field}>
              <span className={styles.label}>العنوان * (وصف واضح)</span>
              <textarea
                className={styles.textarea}
                value={addressText}
                onChange={(e) => setAddressText(e.target.value)}
                placeholder="مثال: شارع الجمهورية، بعد مسجد النور، شبين القناطر"
                maxLength={200}
                rows={3}
              />
            </label>

            <div className={styles.field}>
              <span className={styles.label}>الإحداثيات (اختياري)</span>
              <button type="button" className={styles.locBtn} onClick={handleGetLocation}>
                <MapPinIcon size={16} />
                <span>حدد موقعي تلقائياً</span>
              </button>
              {lat && lng && (
                <p className={styles.coords}>
                  📍 {lat}, {lng}
                </p>
              )}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className={styles.stepTitle}>مراجعة الطلب</h2>
            <p className={styles.stepDesc}>راجع بيانات النشاط قبل إرساله للإدارة للمراجعة</p>

            <div className={styles.summary}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>الاسم</span>
                <span className={styles.summaryValue}>{name}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>النوع</span>
                <span className={styles.summaryValue}>
                  {businessType === 'misc' ? customBusinessType.trim() : TYPES.find((t) => t.value === businessType)?.label}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>المنطقة</span>
                <span className={styles.summaryValue}>{area}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>الموبايل</span>
                <span className={styles.summaryValue}>{phone}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>العنوان</span>
                <span className={styles.summaryValue}>{addressText}</span>
              </div>
            </div>

            <label className={styles.agree}>
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              <span>
                أوافق على{' '}
                <a href="/terms" target="_blank" rel="noreferrer" className={styles.link}>
                  شروط الاستخدام
                </a>{' '}
                و{' '}
                <a href="/privacy" target="_blank" rel="noreferrer" className={styles.link}>
                  سياسة الخصوصية
                </a>
              </span>
            </label>

            <div className={styles.freeNote}>🎁 اشتراكك الأساسي مجاني للأبد — بدون رسوم</div>
          </>
        )}

        {error && <div className={styles.error}>{error}</div>}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        {step > 0 && (
          <button type="button" onClick={handleBack} disabled={pending} className={styles.btnGhost}>
            <ArrowRightIcon size={16} />
            <span>السابق</span>
          </button>
        )}

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className={styles.btnPrimary}
            disabled={!canNext()}
          >
            <span>التالي</span>
            <ArrowLeftIcon size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canNext() || pending}
            className={styles.btnPrimary}
          >
            <span>{pending ? 'بيتم إرسال الطلب…' : 'إرسال الطلب للإدارة'}</span>
            <ArrowLeftIcon size={16} />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Right Arrow icon (inline to avoid extra imports) ───
function ArrowRightIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  )
}
