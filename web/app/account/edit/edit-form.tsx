'use client'

import { useState } from 'react'
import styles from './edit.module.css'

type Props = {
  initial: {
    displayName: string
    gender: string | null
    bio: string | null
  }
}

export default function EditProfileForm({ initial }: Props) {
  const [displayName, setDisplayName] = useState(initial.displayName)
  const [gender, setGender] = useState(initial.gender ?? '')
  const [bio, setBio] = useState(initial.bio ?? '')
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
        <span className={styles.label}>الاسم</span>
        <input
          className={styles.input}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={50}
          required
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>النوع</span>
        <div className={styles.radioRow}>
          <button
            type="button"
            onClick={() => setGender('male')}
            className={`${styles.radio} ${gender === 'male' ? styles.radioActive : ''}`}
          >
            ذكر
          </button>
          <button
            type="button"
            onClick={() => setGender('female')}
            className={`${styles.radio} ${gender === 'female' ? styles.radioActive : ''}`}
          >
            أنثى
          </button>
        </div>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>نبذة</span>
        <textarea
          className={styles.textarea}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={200}
          rows={4}
          placeholder="اكتب حاجة عنك..."
        />
        <span className={styles.counter}>{bio.length} / 200</span>
      </label>

      <button type="submit" className={styles.submit} disabled={saving}>
        {saving ? 'بيحفظ...' : saved ? '✓ اتحفظ' : 'حفظ التغييرات'}
      </button>
    </form>
  )
}
