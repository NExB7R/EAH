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
  BikeIcon,
  SparklesIcon,
} from '@/components/icons'
import { submitMerchantApplication } from '../actions'
import { isEgyptianMobileNumber } from '@/lib/phone-validation'
import styles from './apply-wizard.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Merchant Apply Wizard (4 steps)
// ═══════════════════════════════════════════════════════════

type Props = {
  areas: readonly string[]
}

type BusinessType = 'restaurant' | 'pharmacy' | 'delivery_office' | 'misc'

const STEPS = [
  { key: 'basic', label: 'الأساسيات', Icon: StoreIcon },
  { key: 'contact', label: 'التواصل', Icon: PhoneIcon },
  { key: 'location', label: 'الموقع', Icon: MapPinIcon },
  { key: 'confirm', label: 'التأكيد', Icon: CheckCircleIcon },
] as const

const TYPES: Array<{ value: BusinessType; label: string; Icon: typeof UtensilsIcon }> = [
  { value: 'restaurant', label: 'مطعم', Icon: UtensilsIcon },
  { value: 'pharmacy', label: 'صيدلية', Icon: PillIcon },
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
  const [area, setArea] = useState('')
  const [description, setDescription] = useState('')
  const [hook, setHook] = useState('')

  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([''])
  const [whatsappNumbers, setWhatsappNumbers] = useState<string[]>([])
  const [facebook, setFacebook] = useState('')
  const [instagram, setInstagram] = useState('')

  const [addressText, setAddressText] = useState('')
  const [lat, setLat] = useState<string>('')
  const [lng, setLng] = useState<string>('')

  const [agree, setAgree] = useState(false)

  const canNext = (): boolean => {
    if (step === 0) {
      return name.trim().length >= 2 && area.length > 0 && description.trim().length >= 10
    }
    if (step === 1) {
      const phones = phoneNumbers.map((value) => value.trim()).filter(Boolean)
      const whatsapps = whatsappNumbers.map((value) => value.trim()).filter(Boolean)
      const phoneDigits = phones.map((value) => value.replace(/\D/g, ''))
      const whatsappDigits = whatsapps.map((value) => value.replace(/\D/g, ''))
      return (
        phones.length > 0 &&
        phones.every(isEgyptianMobileNumber) &&
        whatsapps.every(isEgyptianMobileNumber) &&
        new Set(phoneDigits).size === phoneDigits.length &&
        new Set(whatsappDigits).size === whatsappDigits.length
      )
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
    fd.set('area', area)
    fd.set('city', 'شبين القناطر')
    fd.set('description', description)
    fd.set('hook', hook)
    const phones = phoneNumbers.map((value) => value.trim()).filter(Boolean)
    const whatsapps = whatsappNumbers.map((value) => value.trim()).filter(Boolean)
    fd.set('phone', phones[0] ?? '')
    fd.set('whatsapp', whatsapps[0] ?? '')
    fd.set('phone_numbers_json', JSON.stringify(phones))
    fd.set('whatsapp_numbers_json', JSON.stringify(whatsapps))
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
            <p className={styles.stepDesc}>عشان المشترين يوصّلو لك بسهولة</p>

            <div className={styles.contactGroup}>
              <div className={styles.contactGroupHeader}>
                <span className={styles.label}>أرقام الاتصال *</span>
                <span className={styles.contactHint}>أول رقم هو الأساسي</span>
              </div>
              {phoneNumbers.map((number, index) => (
                <div className={styles.contactRow} key={`phone-${index}`}>
                  <input
                    className={styles.input}
                    value={number}
                    onChange={(e) =>
                      setPhoneNumbers((current) =>
                        current.map((value, itemIndex) =>
                          itemIndex === index ? e.target.value.replace(/\D/g, '').slice(0, 11) : value,
                        ),
                      )
                    }
                    placeholder="01xxxxxxxxx"
                    inputMode="tel"
                    maxLength={11}
                    aria-label={index === 0 ? 'رقم الاتصال الأساسي' : `رقم اتصال إضافي ${index}`}
                    dir="ltr"
                  />
                  {index === 0 ? (
                    <span className={styles.primaryNumber}>أساسي</span>
                  ) : (
                    <button
                      type="button"
                      className={styles.removeNumber}
                      onClick={() =>
                        setPhoneNumbers((current) => current.filter((_, itemIndex) => itemIndex !== index))
                      }
                      aria-label="حذف رقم الاتصال"
                    >
                      حذف
                    </button>
                  )}
                </div>
              ))}
              {phoneNumbers.length < 8 && (
                <button
                  type="button"
                  className={styles.addContactButton}
                  onClick={() => setPhoneNumbers((current) => [...current, ''])}
                >
                  + إضافة رقم اتصال
                </button>
              )}
            </div>

            <div className={styles.contactGroup}>
              <div className={styles.contactGroupHeader}>
                <span className={styles.label}>أرقام واتساب</span>
                <span className={styles.contactHint}>اختياري — لا يعني قبول طلبات واتساب</span>
              </div>
              {whatsappNumbers.map((number, index) => (
                <div className={styles.contactRow} key={`whatsapp-${index}`}>
                  <input
                    className={styles.input}
                    value={number}
                    onChange={(e) =>
                      setWhatsappNumbers((current) =>
                        current.map((value, itemIndex) =>
                          itemIndex === index ? e.target.value.replace(/\D/g, '').slice(0, 11) : value,
                        ),
                      )
                    }
                    placeholder="01xxxxxxxxx"
                    inputMode="tel"
                    maxLength={11}
                    aria-label={`رقم واتساب ${index + 1}`}
                    dir="ltr"
                  />
                  <button
                    type="button"
                    className={styles.removeNumber}
                    onClick={() =>
                      setWhatsappNumbers((current) => current.filter((_, itemIndex) => itemIndex !== index))
                    }
                    aria-label="حذف رقم واتساب"
                  >
                    حذف
                  </button>
                </div>
              ))}
              {whatsappNumbers.length < 8 && (
                <button
                  type="button"
                  className={styles.addContactButton}
                  onClick={() => setWhatsappNumbers((current) => [...current, ''])}
                >
                  + إضافة رقم واتساب
                </button>
              )}
            </div>

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
            <p className={styles.stepDesc}>عشان المشترين يلاقوك بسهولة</p>

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
            <h2 className={styles.stepTitle}>التأكيد</h2>
            <p className={styles.stepDesc}>راجع بياناتك قبل الإرسال</p>

            <div className={styles.summary}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>الاسم</span>
                <span className={styles.summaryValue}>{name}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>النوع</span>
                <span className={styles.summaryValue}>
                  {TYPES.find((t) => t.value === businessType)?.label}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>المنطقة</span>
                <span className={styles.summaryValue}>{area}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>الموبايل</span>
                <span className={styles.summaryValue}>{phoneNumbers.map((value) => value.trim()).filter(Boolean).join('، ')}</span>
              </div>
              {whatsappNumbers.some((value) => value.trim()) && (
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>واتساب</span>
                  <span className={styles.summaryValue}>{whatsappNumbers.map((value) => value.trim()).filter(Boolean).join('، ')}</span>
                </div>
              )}
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
            <span>{pending ? 'بيتم الإرسال…' : 'سجّل نشاطك'}</span>
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
