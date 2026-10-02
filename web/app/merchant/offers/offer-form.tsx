'use client'

import { useState, useTransition } from 'react'
import { PlusIcon, CloseIcon, GiftIcon } from '@/components/icons'
import { createOffer } from './actions'
import styles from './offers.module.css'

export default function OfferForm() {
  const [open, setOpen] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    startTransition(async () => {
      const res = await createOffer(formData)
      if (res.ok) {
        setMsg('تم إنشاء العرض ✓')
        form.reset()
        setTimeout(() => {
          setOpen(false)
          setMsg(null)
        }, 1500)
      } else {
        setMsg(res.error)
      }
    })
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={styles.newBtn}>
        <PlusIcon size={16} />
        <span>عرض جديد</span>
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formHead}>
        <span className={styles.formHeadIcon}>
          <GiftIcon size={18} />
        </span>
        <h3 className={styles.formTitle}>عرض جديد</h3>
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
        <label className={styles.label}>العنوان</label>
        <input
          name="title"
          type="text"
          required
          maxLength={80}
          placeholder="مثلاً: خصم 20% على البيتزا"
          className={styles.input}
          dir="rtl"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>الوصف (اختياري)</label>
        <textarea
          name="description"
          maxLength={400}
          rows={3}
          placeholder="تفاصيل العرض…"
          className={styles.textarea}
          dir="rtl"
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>السعر (اختياري)</label>
          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            className={styles.input}
            dir="ltr"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>من</label>
          <input name="startsAt" type="date" className={styles.input} dir="ltr" />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>إلى</label>
          <input name="endsAt" type="date" className={styles.input} dir="ltr" />
        </div>
      </div>

      <label className={styles.switch}>
        <input type="checkbox" name="isPublished" defaultChecked />
        <span>انشر العرض فوراً + إشعار للمتابعين</span>
      </label>

      {msg && <p className={styles.msg}>{msg}</p>}

      <div className={styles.formActions}>
        <button type="submit" disabled={pending} className={styles.submitBtn}>
          {pending ? 'جاري…' : 'احفظ'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className={styles.cancelBtn}>
          إلغاء
        </button>
      </div>
    </form>
  )
}
