'use client'

import { useState } from 'react'
import styles from './security.module.css'

export default function ChangePasswordForm() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg(null)
    if (next.length < 8) {
      setMsg({ type: 'err', text: 'كلمة السر لازم 8 حروف على الأقل' })
      return
    }
    if (next !== confirm) {
      setMsg({ type: 'err', text: 'كلمتين السر مش متطابقتين' })
      return
    }
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    setMsg({ type: 'ok', text: 'كلمة السر اتغيرت' })
    setCurrent('')
    setNext('')
    setConfirm('')
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <label className={styles.field}>
        <span className={styles.label}>كلمة السر الحالية</span>
        <input
          type="password"
          className={styles.input}
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          required
        />
      </label>
      <label className={styles.field}>
        <span className={styles.label}>كلمة السر الجديدة</span>
        <input
          type="password"
          className={styles.input}
          value={next}
          onChange={(e) => setNext(e.target.value)}
          minLength={8}
          required
        />
      </label>
      <label className={styles.field}>
        <span className={styles.label}>تأكيد كلمة السر</span>
        <input
          type="password"
          className={styles.input}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          minLength={8}
          required
        />
      </label>
      {msg && (
        <div className={`${styles.msg} ${msg.type === 'ok' ? styles.ok : styles.err}`}>
          {msg.text}
        </div>
      )}
      <button type="submit" className={styles.submit} disabled={saving}>
        {saving ? 'بيغيّر...' : 'غيّر كلمة السر'}
      </button>
    </form>
  )
}
