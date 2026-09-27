'use client'

import { useState } from 'react'
import styles from './edit.module.css'

type Props = {
  initial: {
    name: string
    area: string
    isOpen: boolean
  }
}

export default function BusinessEditForm({ initial }: Props) {
  const [name, setName] = useState(initial.name)
  const [area, setArea] = useState(initial.area)
  const [isOpen, setIsOpen] = useState(initial.isOpen)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <label className={styles.field}>
        <span className={styles.label}>اسم النشاط</span>
        <input
          className={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          required
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>المنطقة</span>
        <input
          className={styles.input}
          value={area}
          onChange={(e) => setArea(e.target.value)}
          maxLength={50}
        />
      </label>

      <div className={styles.field}>
        <span className={styles.label}>حالة النشاط</span>
        <div className={styles.toggleRow}>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className={`${styles.toggleBtn} ${isOpen ? styles.toggleActive : ''}`}
          >
            مفتوح
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className={`${styles.toggleBtn} ${!isOpen ? styles.toggleActive : ''}`}
          >
            مغلق
          </button>
        </div>
      </div>

      <div className={styles.info}>
        📸 رفع الصور والمنيو — <strong>قريب</strong>
      </div>

      <button type="submit" className={styles.submit} disabled={saving}>
        {saving ? 'بيحفظ...' : saved ? '✓ اتحفظ' : 'حفظ التعديلات'}
      </button>
    </form>
  )
}
