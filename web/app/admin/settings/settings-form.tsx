'use client'

import { useState, useTransition } from 'react'
import {
  CheckCircleIcon,
  AlertIcon,
  SettingsIcon,
  GlobeIcon,
  PhoneIcon,
  BellIcon,
  ShieldCheckIcon,
  StoreIcon,
  CrownGoldIcon,
} from '@/components/icons'
import { saveSettings } from './actions'
import styles from './settings.module.css'

type Props = {
  initial: {
    site_name: string
    support_email: string
    support_whatsapp: string
    announcement_banner: string
    maintenance_mode: boolean
    new_signups_enabled: boolean
    featured_enabled: boolean
  }
}

export default function SettingsForm({ initial }: Props) {
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await saveSettings(formData)
      setMsg(res.ok ? { type: 'ok', text: 'اتحفظ ✓' } : { type: 'err', text: res.error })
      setTimeout(() => setMsg(null), 3000)
    })
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {/* عام */}
      <fieldset className={styles.section}>
        <legend className={styles.legend}>
          <GlobeIcon size={14} />
          <span>عام</span>
        </legend>

        <label className={styles.field}>
          <span className={styles.label}>اسم الموقع</span>
          <input
            className={styles.input}
            name="site_name"
            defaultValue={initial.site_name}
            maxLength={60}
            required
            dir="rtl"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>
            بانر الإعلان <span className={styles.hint}>يظهر أعلى الموقع</span>
          </span>
          <input
            className={styles.input}
            name="announcement_banner"
            defaultValue={initial.announcement_banner}
            maxLength={200}
            placeholder="اتركه فاضي عشان يختفي"
            dir="rtl"
          />
        </label>
      </fieldset>

      {/* التواصل */}
      <fieldset className={styles.section}>
        <legend className={styles.legend}>
          <PhoneIcon size={14} />
          <span>التواصل</span>
        </legend>

        <div className={styles.row}>
          <label className={styles.field}>
            <span className={styles.label}>إيميل الدعم</span>
            <input
              className={styles.input}
              name="support_email"
              type="email"
              defaultValue={initial.support_email}
              maxLength={120}
              dir="ltr"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>واتساب الدعم</span>
            <input
              className={styles.input}
              name="support_whatsapp"
              type="tel"
              defaultValue={initial.support_whatsapp}
              maxLength={30}
              dir="ltr"
            />
          </label>
        </div>
      </fieldset>

      {/* Feature Flags */}
      <fieldset className={styles.section}>
        <legend className={styles.legend}>
          <CrownGoldIcon size={14} />
          <span>Feature Flags</span>
        </legend>

        <label className={styles.toggle}>
          <input
            type="checkbox"
            name="maintenance_mode"
            defaultChecked={initial.maintenance_mode}
            className={styles.checkbox}
          />
          <span className={styles.toggleTrack} aria-hidden />
          <span className={styles.toggleBody}>
            <ShieldCheckIcon size={14} />
            <span>
              <strong>وضع الصيانة</strong>
              <small>يوقف الموقع مؤقتاً للصيانة</small>
            </span>
          </span>
        </label>

        <label className={styles.toggle}>
          <input
            type="checkbox"
            name="new_signups_enabled"
            defaultChecked={initial.new_signups_enabled}
            className={styles.checkbox}
          />
          <span className={styles.toggleTrack} aria-hidden />
          <span className={styles.toggleBody}>
            <StoreIcon size={14} />
            <span>
              <strong>تسجيل الأنشطة الجديدة</strong>
              <small>السماح بتقديم أنشطة جديدة</small>
            </span>
          </span>
        </label>

        <label className={styles.toggle}>
          <input
            type="checkbox"
            name="featured_enabled"
            defaultChecked={initial.featured_enabled}
            className={styles.checkbox}
          />
          <span className={styles.toggleTrack} aria-hidden />
          <span className={styles.toggleBody}>
            <CrownGoldIcon size={14} />
            <span>
              <strong>نظام التمييز</strong>
              <small>إظهار الأنشطة المميزة في Home</small>
            </span>
          </span>
        </label>
      </fieldset>

      {/* تنبيه */}
      <div className={styles.warning}>
        <BellIcon size={14} />
        <span>
          التعديلات الحساسة بتتسجل في سجل التدقيق. الأخطر (زي الصيانة) بتحتاج تأكيد إضافي.
        </span>
      </div>

      {msg && (
        <div className={`${styles.msg} ${msg.type === 'ok' ? styles.msgOk : styles.msgErr}`}>
          {msg.type === 'ok' ? <CheckCircleIcon size={14} /> : <AlertIcon size={14} />}
          <span>{msg.text}</span>
        </div>
      )}

      <div className={styles.actions}>
        <button type="submit" className={styles.submit} disabled={pending}>
          <SettingsIcon size={14} />
          <span>{pending ? 'بيحفظ…' : 'حفظ الإعدادات'}</span>
        </button>
      </div>
    </form>
  )
}
