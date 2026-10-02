'use client'

import { useState, useTransition } from 'react'
import {
  CheckCircleIcon,
  AlertIcon,
  StoreIcon,
  PhoneIcon,
  WhatsAppIcon,
  FileTextIcon,
} from '@/components/icons'
import { updateMyBusiness } from './actions'
import styles from './edit.module.css'

type Props = {
  initial: {
    name: string
    area: string
    description: string
    hook: string
    address: string
    isOpen: boolean
    acceptsWhatsapp: boolean
    phone: string
    whatsapp: string
  }
}

export default function BusinessEditForm({ initial }: Props) {
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    startTransition(async () => {
      const res = await updateMyBusiness(formData)
      if (res.ok) {
        setMsg({ type: 'ok', text: 'اتحفظ ✓' })
      } else {
        setMsg({ type: 'err', text: res.error })
      }
      setTimeout(() => setMsg(null), 3000)
    })
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {/* ═══ القسم الأساسي ═══ */}
      <fieldset className={styles.section}>
        <legend className={styles.legend}>
          <StoreIcon size={14} />
          <span>الأساسي</span>
        </legend>

        <label className={styles.field}>
          <span className={styles.label}>اسم النشاط *</span>
          <input
            className={styles.input}
            name="name"
            defaultValue={initial.name}
            maxLength={80}
            required
            dir="rtl"
          />
        </label>

        <div className={styles.row}>
          <label className={styles.field}>
            <span className={styles.label}>المنطقة</span>
            <input
              className={styles.input}
              name="area"
              defaultValue={initial.area}
              maxLength={50}
              placeholder="شبين القناطر"
              dir="rtl"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>العنوان التفصيلي</span>
            <input
              className={styles.input}
              name="address_text"
              defaultValue={initial.address}
              maxLength={200}
              placeholder="شارع الجمهورية — أمام مسجد النور"
              dir="rtl"
            />
          </label>
        </div>

        <label className={styles.field}>
          <span className={styles.label}>
            الهوك <span className={styles.hint}>سطر قصير يلفت الانتباه</span>
          </span>
          <input
            className={styles.input}
            name="hook"
            defaultValue={initial.hook}
            maxLength={120}
            placeholder="أحلى بيتزا في شبين — جرّبها مرة وهتعرف"
            dir="rtl"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>الوصف</span>
          <textarea
            className={styles.textarea}
            name="description"
            defaultValue={initial.description}
            maxLength={500}
            rows={3}
            placeholder="اكتب عن نشاطك — إيه اللي يميزك؟"
            dir="rtl"
          />
        </label>
      </fieldset>

      {/* ═══ التواصل ═══ */}
      <fieldset className={styles.section}>
        <legend className={styles.legend}>
          <PhoneIcon size={14} />
          <span>التواصل</span>
        </legend>

        <div className={styles.row}>
          <label className={styles.field}>
            <span className={styles.label}>رقم التليفون</span>
            <input
              className={styles.input}
              name="phone"
              type="tel"
              defaultValue={initial.phone}
              placeholder="010xxxxxxxx"
              dir="ltr"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>رقم الواتساب</span>
            <input
              className={styles.input}
              name="whatsapp"
              type="tel"
              defaultValue={initial.whatsapp}
              placeholder="010xxxxxxxx"
              dir="ltr"
            />
          </label>
        </div>
      </fieldset>

      {/* ═══ الحالة ═══ */}
      <fieldset className={styles.section}>
        <legend className={styles.legend}>
          <CheckCircleIcon size={14} />
          <span>الحالة</span>
        </legend>

        <label className={styles.toggle}>
          <input
            type="checkbox"
            name="is_open"
            defaultChecked={initial.isOpen}
            className={styles.checkbox}
          />
          <span className={styles.toggleTrack} aria-hidden />
          <span className={styles.toggleLabel}>النشاط مفتوح دلوقتي</span>
        </label>

        <label className={styles.toggle}>
          <input
            type="checkbox"
            name="accepts_whatsapp_orders"
            defaultChecked={initial.acceptsWhatsapp}
            className={styles.checkbox}
          />
          <span className={styles.toggleTrack} aria-hidden />
          <span className={styles.toggleLabel}>
            <WhatsAppIcon size={14} />
            استقبل طلبات على واتساب
          </span>
        </label>
      </fieldset>

      {/* ═══ معلومات إضافية ═══ */}
      <div className={styles.info}>
        <FileTextIcon size={14} />
        <span>
          رفع الصور والمنيو — قريب هيكون من هنا كمان. دلوقتي كل حاجة تتعدّل من الفوتر أو كلمنا.
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
          {pending ? 'بيحفظ…' : 'حفظ التعديلات'}
        </button>
      </div>
    </form>
  )
}
