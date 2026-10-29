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
import ConfirmModal from '@/components/ui/confirm-modal'
import { saveSettings } from './actions'
import styles from './settings.module.css'

type Props = {
  initial: {
    site_name: string
    support_email: string
    support_whatsapp: string
    support_facebook_url: string
    whatsapp_channel_url: string
    public_contacts_enabled: boolean
    announcement_banner: string
    maintenance_mode: boolean
    new_signups_enabled: boolean
    featured_enabled: boolean
  }
}

type PendingToggle =
  { kind: 'maintenance'; next: boolean } | { kind: 'signups'; next: boolean } | null

export default function SettingsForm({ initial }: Props) {
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  // state للـ toggles الحساسة
  const [maintenance, setMaintenance] = useState(initial.maintenance_mode)
  const [signups, setSignups] = useState(initial.new_signups_enabled)

  // modal state
  const [pendingToggle, setPendingToggle] = useState<PendingToggle>(null)

  const handleMaintenanceToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.checked
    // لو بنشغل الصيانة → تأكيد. لو بنطفيها → مباشر
    if (next) {
      setPendingToggle({ kind: 'maintenance', next })
    } else {
      setMaintenance(false)
    }
  }

  const handleSignupsToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.checked
    // لو بنقفل التسجيل → تأكيد. لو بنفتحه → مباشر
    if (!next) {
      setPendingToggle({ kind: 'signups', next })
    } else {
      setSignups(true)
    }
  }

  const confirmToggle = () => {
    if (!pendingToggle) return
    if (pendingToggle.kind === 'maintenance') setMaintenance(pendingToggle.next)
    if (pendingToggle.kind === 'signups') setSignups(pendingToggle.next)
    setPendingToggle(null)
  }

  const cancelToggle = () => setPendingToggle(null)

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    // نضمن القيم الفعلية للـ toggles
    formData.set('maintenance_mode', maintenance ? 'on' : '')
    formData.set('new_signups_enabled', signups ? 'on' : '')
    startTransition(async () => {
      const res = await saveSettings(formData)
      setMsg(res.ok ? { type: 'ok', text: 'اتحفظ ✓' } : { type: 'err', text: res.error })
      setTimeout(() => setMsg(null), 3000)
    })
  }

  return (
    <>
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
              <span className={styles.label}>إيميل الدعم الرسمي</span>
              <input className={styles.input} name="support_email" type="email" defaultValue={initial.support_email} maxLength={120} dir="ltr" placeholder="لم تتم إضافته بعد" />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>رقم واتساب الدعم الرسمي</span>
              <input className={styles.input} name="support_whatsapp" type="tel" defaultValue={initial.support_whatsapp} maxLength={30} dir="ltr" placeholder="يُضاف بعد اعتماد الرقم" />
            </label>
          </div>

          <div className={styles.row}>
            <label className={styles.field}>
              <span className={styles.label}>رابط فيسبوك الرسمي</span>
              <input className={styles.input} name="support_facebook_url" type="url" defaultValue={initial.support_facebook_url} maxLength={300} dir="ltr" placeholder="https://facebook.com/..." />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>رابط قناة واتساب الرسمية</span>
              <input className={styles.input} name="whatsapp_channel_url" type="url" defaultValue={initial.whatsapp_channel_url} maxLength={300} dir="ltr" placeholder="https://whatsapp.com/channel/..." />
            </label>
          </div>

          <label className={styles.toggle}>
            <input type="checkbox" name="public_contacts_enabled" defaultChecked={initial.public_contacts_enabled} className={styles.checkbox} />
            <span className={styles.toggleTrack} aria-hidden />
            <span className={styles.toggleBody}>
              <ShieldCheckIcon size={14} />
              <span>
                <strong>إظهار قنوات التواصل للزوار</strong>
                <small>تظل القنوات مخفية حتى تفعيل هذا الخيار بعد اعتماد الروابط والأرقام الرسمية.</small>
              </span>
            </span>
          </label>
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
              checked={maintenance}
              onChange={handleMaintenanceToggle}
              className={styles.checkbox}
            />
            <span className={styles.toggleTrack} aria-hidden />
            <span className={styles.toggleBody}>
              <ShieldCheckIcon size={14} />
              <span>
                <strong>وضع الصيانة</strong>
                <small>يوقف الموقع مؤقتاً للصيانة — يحتاج تأكيد</small>
              </span>
            </span>
          </label>

          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={signups}
              onChange={handleSignupsToggle}
              className={styles.checkbox}
            />
            <span className={styles.toggleTrack} aria-hidden />
            <span className={styles.toggleBody}>
              <StoreIcon size={14} />
              <span>
                <strong>تسجيل بدايات (المشاريع الجديدة)</strong>
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
            التعديلات الحساسة بتتسجل في سجل التدقيق. الصيانة وإيقاف التسجيل بيحتاجوا تأكيد إضافي.
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

      {/* Confirmation modals */}
      <ConfirmModal
        open={pendingToggle?.kind === 'maintenance'}
        title="تشغيل وضع الصيانة؟"
        message="هيوقف الموقع مؤقتاً — كل الزوار هيشوفوا 'الموقع تحت الصيانة'. متأكد؟"
        confirmLabel="تشغيل الصيانة"
        tone="danger"
        pending={pending}
        onConfirm={confirmToggle}
        onCancel={cancelToggle}
      />

      <ConfirmModal
        open={pendingToggle?.kind === 'signups'}
        title="إيقاف تسجيل الأنشطة الجديدة؟"
        message="هيوقف استقبال طلبات الأنشطة الجديدة. الأنشطة الحالية مش هتتأثر. متأكد؟"
        confirmLabel="إيقاف التسجيل"
        tone="warn"
        pending={pending}
        onConfirm={confirmToggle}
        onCancel={cancelToggle}
      />
    </>
  )
}
