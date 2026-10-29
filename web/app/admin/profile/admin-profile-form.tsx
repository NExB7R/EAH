'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Avatar from '@/components/avatar'
import { updateAdminProfile } from './actions'
import styles from './profile.module.css'

type Props = {
  initial: {
    displayName: string
    avatarUrl: string | null
    role: 'super_admin'
    phoneVerified: boolean
  }
}

export default function AdminProfileForm({ initial }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [displayName, setDisplayName] = useState(initial.displayName)
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload/avatar', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) {
        setUploadError(data.error ?? 'فشل رفع الصورة')
      } else {
        setAvatarUrl(data.url)
        router.refresh()
      }
    } catch {
      setUploadError('فشل الاتصال')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMsg(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await updateAdminProfile(fd)
      if (res.ok) {
        setMsg('✓ اتحفظ')
        router.refresh()
        setTimeout(() => setMsg(null), 2500)
      } else {
        setMsg(res.error)
      }
    })
  }

  return (
    <div className={styles.wrap}>
      <section className={styles.card}>
        <header className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>الصورة</h3>
          <p className={styles.cardDesc}>اضغط على الصورة لتغييرها</p>
        </header>

        <div className={styles.avatarRow}>
          <button
            type="button"
            className={styles.avatarBtn}
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            aria-label="تغيير الصورة"
          >
            <Avatar
              displayName={displayName}
              avatarUrl={avatarUrl}
              role={initial.role}
              phoneVerified={initial.phoneVerified}
              size="lg"
            />
            <span className={styles.avatarOverlay}>{uploading ? '...' : 'تغيير'}</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className={styles.hiddenInput}
            aria-hidden
            tabIndex={-1}
          />
          <div className={styles.avatarInfo}>
            <div className={styles.avatarName}>{displayName}</div>
            <div className={styles.avatarHint}>{avatarUrl ? 'في صورة حاليًا' : 'مفيش صورة'}</div>
            {uploadError && <div className={styles.errorMsg}>{uploadError}</div>}
          </div>
        </div>
      </section>

      <form className={styles.card} onSubmit={onSubmit}>
        <header className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>الاسم</h3>
          <p className={styles.cardDesc}>الاسم اللي هيظهر في اللوحة</p>
        </header>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="display_name">
            الاسم
          </label>
          <input
            id="display_name"
            name="display_name"
            className={styles.input}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={50}
            required
            placeholder="اسمك"
          />
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.submit} disabled={pending}>
            {pending ? 'بيحفظ...' : 'حفظ'}
          </button>
          {msg && <span className={styles.msg}>{msg}</span>}
        </div>
      </form>
    </div>
  )
}
