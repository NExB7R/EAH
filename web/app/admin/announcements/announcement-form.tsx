'use client'

import { useState, useTransition, useRef } from 'react'
import { PlusIcon } from '@/components/icons'
import { createAnnouncement } from './actions'
import styles from './announcements.module.css'

const THEMES: { value: 'gold' | 'purple' | 'orange' | 'teal'; label: string }[] = [
  { value: 'gold', label: 'ذهبي' },
  { value: 'purple', label: 'بنفسجي' },
  { value: 'orange', label: 'برتقالي' },
  { value: 'teal', label: 'تركواز' },
]

export default function AnnouncementForm() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const res = await createAnnouncement(formData)
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
        <span>إعلان جديد</span>
      </button>
    )
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
      <h3 className={styles.formTitle}>إعلان جديد</h3>

      <div className={styles.field}>
        <label htmlFor="ann-title">العنوان *</label>
        <input
          id="ann-title"
          name="title"
          type="text"
          required
          maxLength={120}
          placeholder="مثال: عرض خاص بمناسبة العيد"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="ann-body">النص (اختياري)</label>
        <textarea
          id="ann-body"
          name="body"
          maxLength={400}
          rows={2}
          placeholder="تفاصيل إضافية..."
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="ann-theme">اللون</label>
          <select id="ann-theme" name="theme" defaultValue="gold">
            {THEMES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="ann-linkLabel">نص الزر (اختياري)</label>
          <input
            id="ann-linkLabel"
            name="linkLabel"
            type="text"
            maxLength={40}
            placeholder="اعرف أكتر"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="ann-linkUrl">الرابط (اختياري)</label>
          <input
            id="ann-linkUrl"
            name="linkUrl"
            type="text"
            maxLength={300}
            placeholder="/offers"
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="ann-starts">يبدأ (اختياري)</label>
          <input id="ann-starts" name="startsAt" type="datetime-local" />
        </div>
        <div className={styles.field}>
          <label htmlFor="ann-ends">ينتهي (اختياري)</label>
          <input id="ann-ends" name="endsAt" type="datetime-local" />
        </div>
      </div>

      <label className={styles.checkbox}>
        <input type="checkbox" name="dismissible" defaultChecked />
        <span>الزائر يقدر يغلق الإعلان</span>
      </label>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.actions}>
        <button type="submit" disabled={pending} className={styles.primaryBtn}>
          {pending ? 'جاري النشر...' : 'انشر الإعلان'}
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
