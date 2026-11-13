'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { LockIcon, EyeIcon, ShieldCheckIcon, CheckCircleIcon } from '@/components/icons'
import type { PrivacySettings, PhoneLookupMode } from '@/lib/types/privacy'
import { updateMyPrivacySettings } from '@/lib/actions/privacy'
import styles from './privacy-section.module.css'

type Props = {
  initial: PrivacySettings
  /** "admin" | "user" — يغير نبرة النصوص */
  context?: 'admin' | 'user'
}

const MODES: {
  value: PhoneLookupMode
  label: string
  desc: string
  Icon: typeof LockIcon
}[] = [
  {
    value: 'full',
    label: 'يظهر اسمي ونشاطي',
    desc: 'كل شيء يظهر — الاسم، الصورة، النشاط، التقييمات',
    Icon: EyeIcon,
  },
  {
    value: 'trust_only',
    label: 'المصداقية فقط',
    desc: 'يظهر trust + شارات بدون اسم أو صورة — يثبت أنك موثوق',
    Icon: ShieldCheckIcon,
  },
  {
    value: 'anonymous',
    label: 'مخفي تمامًا',
    desc: 'لا يظهر شيء — حتى المصداقية. الطيار يرى "رقم مسجل" فقط',
    Icon: LockIcon,
  },
]

export function PrivacySection({ initial, context = 'user' }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [settings, setSettings] = useState<PrivacySettings>(initial)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const update = <K extends keyof PrivacySettings>(key: K, value: PrivacySettings[K]) => {
    setSettings((s) => ({ ...s, [key]: value }))
    setMsg(null)
  }

  const onSave = () => {
    startTransition(async () => {
      const res = await updateMyPrivacySettings({
        phone_lookup_mode: settings.phone_lookup_mode,
        hide_avatar: settings.hide_avatar,
        hide_favorites: settings.hide_favorites,
        hide_following: settings.hide_following,
        hide_comments: settings.hide_comments,
        hide_reviews: settings.hide_reviews,
      })
      if (res.ok) {
        setMsg({ type: 'ok', text: '✓ تم الحفظ' })
        router.refresh()
        setTimeout(() => setMsg(null), 2500)
      } else {
        setMsg({ type: 'err', text: res.error })
      }
    })
  }

  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <h3 className={styles.title}>
          <LockIcon size={16} /> الخصوصية والبحث
        </h3>
        <p className={styles.desc}>
          {context === 'admin'
            ? 'تتحكم في ماذا يظهر عندما يبحث أحد برقمك. بصفتك سوبر أدمن، تفاصيلك قد تكون حساسة.'
            : 'تتحكم في ماذا يظهر عندما يبحث أحد برقمك الكامل'}
        </p>
      </header>

      <div className={styles.modeGroup} role="radiogroup" aria-label="وضع الظهور">
        {MODES.map((m) => {
          const active = settings.phone_lookup_mode === m.value
          return (
            <button
              key={m.value}
              type="button"
              role="radio"
              aria-checked={active}
              className={`${styles.modeCard} ${active ? styles.modeCardActive : ''}`}
              onClick={() => update('phone_lookup_mode', m.value)}
            >
              <span className={styles.modeIcon}>
                <m.Icon size={18} />
              </span>
              <span className={styles.modeBody}>
                <strong className={styles.modeLabel}>{m.label}</strong>
                <span className={styles.modeDesc}>{m.desc}</span>
              </span>
              {active && (
                <span className={styles.modeCheck}>
                  <CheckCircleIcon size={16} />
                </span>
              )}
            </button>
          )
        })}
      </div>

      {settings.phone_lookup_mode === 'full' && <Toggles settings={settings} update={update} />}

      <div className={styles.footer}>
        <button type="button" className={styles.saveBtn} onClick={onSave} disabled={pending}>
          {pending ? 'بيحفظ…' : 'حفظ الإعدادات'}
        </button>
        {msg && (
          <span className={msg.type === 'ok' ? styles.okMsg : styles.errMsg}>{msg.text}</span>
        )}
      </div>
    </section>
  )
}

function Toggles({
  settings,
  update,
}: {
  settings: PrivacySettings
  update: <K extends keyof PrivacySettings>(key: K, value: PrivacySettings[K]) => void
}) {
  const items: { key: keyof PrivacySettings; label: string; desc: string }[] = [
    { key: 'hide_avatar', label: 'إخفاء الصورة', desc: 'الطيار لا يرى صورتك' },
    { key: 'hide_favorites', label: 'إخفاء المفضلة', desc: 'قائمة الأنشطة المحفوظة' },
    { key: 'hide_following', label: 'إخفاء المتابعات', desc: 'الأنشطة التي تتابعها' },
    { key: 'hide_comments', label: 'إخفاء التعليقات', desc: 'عدد تعليقاتك على الأنشطة' },
    { key: 'hide_reviews', label: 'إخفاء التقييمات', desc: 'متوسط تقييماتك' },
  ]

  return (
    <div className={styles.togglesBlock}>
      <h4 className={styles.togglesTitle}>ماذا يظهر في وضع «يظهر اسمي»؟</h4>
      <div className={styles.toggles}>
        {items.map((item) => {
          const visible = !settings[item.key] as boolean
          return (
            <label key={item.key} className={styles.toggleRow}>
              <span className={styles.toggleText}>
                <strong>{item.label}</strong>
                <span>{item.desc}</span>
              </span>
              <input
                type="checkbox"
                checked={visible}
                onChange={(e) => update(item.key, !e.target.checked as never)}
                className={styles.switch}
                aria-label={item.label}
              />
            </label>
          )
        })}
      </div>
    </div>
  )
}
