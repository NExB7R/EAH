'use client'

import { useState, useTransition, useRef } from 'react'
import { PlusIcon, CloseIcon } from '@/components/icons'
import { requestAd } from './actions'
import type { SlotOption } from '@/lib/data/ads'
import styles from './ads.module.css'

type Props = {
  slots: SlotOption[]
}

export default function RequestForm({ slots }: Props) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const res = await requestAd(formData)
      if (res.ok) {
        formRef.current?.reset()
        setOpen(false)
      } else {
        setError(res.error)
      }
    })
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={styles.newBtn}>
        <PlusIcon size={16} />
        <span>طلب إعلان جديد</span>
      </button>
    )
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formHead}>
        <h3 className={styles.formTitle}>طلب إعلان</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className={styles.formClose}
          aria-label="إغلاق"
        >
          <CloseIcon size={16} />
        </button>
      </div>

      <div className={styles.field}>
        <label htmlFor="ad-slot">المكان *</label>
        <select id="ad-slot" name="slotId" required>
          <option value="">اختر مكان الإعلان</option>
          {slots.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name_ar} — {s.base_price_egp} ج.م / أسبوع
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="ad-title">عنوان الإعلان *</label>
        <input
          id="ad-title"
          name="title"
          type="text"
          required
          maxLength={80}
          placeholder="مثال: عرض خاص على أول طلب"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="ad-img">رابط الصورة (اختياري)</label>
        <input id="ad-img" name="imageUrl" type="url" maxLength={500} placeholder="https://..." />
      </div>

      <div className={styles.field}>
        <label htmlFor="ad-link">الرابط (اختياري)</label>
        <input id="ad-link" name="linkUrl" type="url" maxLength={500} placeholder="https://..." />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="ad-start">يبدأ (اختياري)</label>
          <input id="ad-start" name="startsAt" type="datetime-local" />
        </div>
        <div className={styles.field}>
          <label htmlFor="ad-end">ينتهي (اختياري)</label>
          <input id="ad-end" name="endsAt" type="datetime-local" />
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <p className={styles.hint}>
        الإعلان هيروح للمراجعة الأول، وبعد الموافقة هيظهر. الدفع يدوي مع الإدارة.
      </p>

      <div className={styles.actions}>
        <button type="submit" disabled={pending} className={styles.primaryBtn}>
          {pending ? 'جاري الإرسال...' : 'أرسل الطلب'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={pending}
          className={styles.secondaryBtn}
        >
          إلغاء
        </button>
      </div>
    </form>
  )
}
