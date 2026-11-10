'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AvatarUploader } from '@/components/profile/avatar-uploader'
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
  const [msg, setMsg] = useState<string | null>(null)

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
          <p className={styles.cardDesc}>اسحب صورة أو اضغط للاختيار — يمكنك قصها ثم حفظها</p>
        </header>
        <AvatarUploader
          displayName={displayName}
          avatarUrl={initial.avatarUrl}
          role={initial.role}
          compact
        />
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
