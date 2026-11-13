'use client'

import { Fragment, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon, AlertIcon, CheckCircleIcon } from '@/components/icons'
import { useDraft } from '@/lib/hooks/use-draft'
import { isEgyptianMobileNumber } from '@/lib/phone-validation'
import { createBusiness } from '../actions'
import BasicsStep from './basics-step'
import LocationStep from './location-step'
import OptionsStep from './options-step'
import ReviewStep from './review-step'
import styles from './wizard.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — New Business Wizard (4 steps + review)
// Glass around, solid inside. Draft persistence. Inline validation.
// ═══════════════════════════════════════════════════════════

export type ContactKind =
  'phone' | 'whatsapp' | 'complaints' | 'manager' | 'shift_morning' | 'shift_evening' | 'additional'

export type Contact = {
  tempId: string
  kind: ContactKind
  value: string
  is_primary: boolean
}

export type WizardData = {
  business_type: string
  name: string
  hook: string
  description: string
  city: string
  area: string
  address_text: string
  contacts: Contact[]
  is_open: boolean
  accepts_whatsapp_orders: boolean
  owner_user_id: string
  custom_business_type: string
}

export type OwnerOption = {
  id: string
  display_name: string
  phone: string | null
  role: 'customer' | 'merchant'
}

const INITIAL: WizardData = {
  business_type: 'restaurant',
  name: '',
  hook: '',
  description: '',
  city: 'شبين القناطر',
  area: '',
  address_text: '',
  contacts: [{ tempId: 'c1', kind: 'phone', value: '', is_primary: true }],
  is_open: true,
  accepts_whatsapp_orders: false,
  owner_user_id: '',
  custom_business_type: '',
}

const STEPS = [
  { key: 'basics', label: 'الأساسيات' },
  { key: 'location', label: 'الموقع والتواصل' },
  { key: 'options', label: 'الخيارات' },
  { key: 'review', label: 'المراجعة' },
]

const DRAFT_KEY = 'eah-admin-new-business'
const DRAFT_VERSION = 1

export default function NewBusinessWizard({ owners }: { owners: OwnerOption[] }) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const { data, setData, hasDraft, savedAt, clear } = useDraft<WizardData>(
    DRAFT_KEY,
    DRAFT_VERSION,
    INITIAL,
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const update = (patch: Partial<WizardData>) => {
    setData((d) => ({ ...d, ...patch }))
    const next = { ...errors }
    for (const k of Object.keys(patch)) delete next[k]
    setErrors(next)
  }

  const validateStep = (index: number): boolean => {
    const errs: Record<string, string> = {}
    if (index === 0) {
      if (!data.business_type) errs.business_type = 'اختر نوع النشاط'
      if (data.business_type === 'misc') {
        const custom = data.custom_business_type.trim()
        if (custom.length < 2) errs.custom_business_type = 'اكتب نوع النشاط (حرفين على الأقل)'
        else if (custom.length > 50) errs.custom_business_type = 'النوع طويل (50 حرف كحد أقصى)'
      }
      const name = data.name.trim()
      if (name.length < 2) errs.name = 'الاسم قصير (حرفين على الأقل)'
      else if (name.length > 80) errs.name = 'الاسم طويل (80 حرف كحد أقصى)'
    }
    if (index === 1) {
      const primary = data.contacts.find((c) => c.kind === 'phone' && c.is_primary)
      if (!primary || !primary.value.trim()) {
        errs.contacts = 'لازم رقم هاتف أساسي واحد على الأقل'
      } else if (!isEgyptianMobileNumber(primary.value.trim())) {
        errs.contacts = 'رقم الهاتف الأساسي غير صحيح'
      }
      const seen = new Set<string>()
      for (const c of data.contacts) {
        const v = c.value.trim()
        if (!v) continue
        if (!isEgyptianMobileNumber(v)) {
          errs.contacts = 'رقم غير صحيح (يبدأ بـ 0 و10-13 رقم)'
          break
        }
        if (seen.has(v)) {
          errs.contacts = 'فيه رقم متكرر'
          break
        }
        seen.add(v)
      }
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const next = () => {
    if (!validateStep(step)) return
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const back = () => {
    setStep((s) => Math.max(0, s - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const jumpTo = (index: number) => {
    if (index < step) {
      setStep(index)
      return
    }
    for (let i = step; i < index; i++) {
      if (!validateStep(i)) {
        setStep(i)
        return
      }
    }
    setStep(index)
  }

  const resetDraft = () => {
    clear()
    setData(INITIAL)
    setStep(0)
    setErrors({})
    setSubmitError(null)
  }

  const submit = async () => {
    if (!validateStep(0)) {
      setStep(0)
      return
    }
    if (!validateStep(1)) {
      setStep(1)
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    try {
      const fd = new FormData()
      fd.set('name', data.name.trim())
      fd.set('business_type', data.business_type)
      if (data.business_type === 'misc' && data.custom_business_type.trim()) {
        fd.set('custom_business_type', data.custom_business_type.trim())
      }
      fd.set('hook', data.hook.trim())
      fd.set('description', data.description.trim())
      fd.set('city', data.city.trim())
      fd.set('area', data.area.trim())
      fd.set('address_text', data.address_text.trim())
      fd.set(
        'contacts_json',
        JSON.stringify(
          data.contacts
            .filter((c) => c.value.trim())
            .map((c) => ({
              kind: c.kind,
              value: c.value.trim(),
              is_primary: c.is_primary,
            })),
        ),
      )
      if (data.is_open) fd.set('is_open', 'on')
      if (data.accepts_whatsapp_orders) fd.set('accepts_whatsapp_orders', 'on')
      if (data.owner_user_id) {
        fd.set('owner_profile_id', data.owner_user_id)
      }
      // Admin-created businesses start as drafts. Publish after completing
      // media/hours/location in the edit tab.
      fd.set('is_published', 'off')

      const res = await createBusiness(fd)
      if (res.ok && res.id) {
        clear()
        // Continue straight to the created record so admin can verify visibility
        // and finish media/owner details without searching the list again.
        router.push(`/admin/businesses/${res.id}?tab=edit&from=create`)
        router.refresh()
      } else {
        setSubmitError(res.ok ? 'النشاط اتعمل لكن تعذر فتح صفحته — افتح قائمة الأنشطة' : res.error)
      }
    } catch {
      setSubmitError('حدث خطأ غير متوقع — حاول تاني')
    } finally {
      setSubmitting(false)
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <div className={styles.wrap}>
      <div className={styles.main}>
        {hasDraft && savedAt && (
          <div className={styles.draftBar}>
            <CheckCircleIcon size={14} />
            <span>رجّعنا مسودتك السابقة</span>
            <button type="button" onClick={resetDraft}>
              ابدأ من جديد
            </button>
          </div>
        )}

        <div className={styles.stepper}>
          {STEPS.map((s, i) => (
            <Fragment key={s.key}>
              <button
                type="button"
                onClick={() => jumpTo(i)}
                className={`${styles.step} ${i === step ? styles.stepActive : ''} ${i < step ? styles.stepDone : ''}`}
                disabled={i > step}
                aria-current={i === step ? 'step' : undefined}
              >
                <span className={styles.stepDot}>{i < step ? '✓' : i + 1}</span>
                <span>{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <span
                  className={`${styles.stepSep} ${i < step ? styles.stepSepDone : ''}`}
                  aria-hidden
                />
              )}
            </Fragment>
          ))}
        </div>

        <div className={styles.progressBar} aria-hidden>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>

        <div className={styles.card} key={step}>
          {step === 0 && <BasicsStep data={data} errors={errors} update={update} />}
          {step === 1 && <LocationStep data={data} errors={errors} update={update} />}
          {step === 2 && <OptionsStep data={data} owners={owners} update={update} />}
          {step === 3 && <ReviewStep data={data} owners={owners} goTo={jumpTo} />}
        </div>

        {submitError && (
          <div className={styles.errorBanner}>
            <AlertIcon size={14} />
            <span>{submitError}</span>
          </div>
        )}

        <div className={styles.nav}>
          <button
            type="button"
            onClick={back}
            disabled={step === 0 || submitting}
            className={styles.btnBack}
          >
            <ArrowLeftIcon size={14} />
            <span>رجوع</span>
          </button>
          <div className={styles.navRight}>
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={next} className={styles.btnNext}>
                التالي
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className={styles.btnCreate}
              >
                {submitting ? 'بيتحفظ…' : 'إنشاء النشاط'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
