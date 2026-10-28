'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertIcon, CloseIcon, CheckCircleIcon, CrownGoldIcon, StarIcon } from '@/components/icons'
import { banUser, unbanUser, changeUserRole, adjustTrust, togglePremium } from '../actions'
import styles from './user-detail.module.css'

type Props = {
  userId: string
  isBanned: boolean
  isPremium: boolean
  currentRole: string
  trustScore: number
}

const ROLES = [
  { value: 'customer', label: 'المشتري' },
  { value: 'merchant', label: 'البايع' },
  { value: 'admin', label: 'الأدمن' },
]

function getRoleLabel(role: string): string {
  return ROLES.find((item) => item.value === role)?.label ?? (role === 'super_admin' ? 'الأدمن' : role)
}

type Modal = 'ban' | 'role' | 'trust' | null

export default function UserDetailActions({
  userId,
  isBanned,
  isPremium,
  currentRole,
  trustScore,
}: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [modal, setModal] = useState<Modal>(null)
  const [error, setError] = useState<string | null>(null)

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setError(null)
    startTransition(async () => {
      const res = await fn()
      if (res.ok) {
        setModal(null)
        router.refresh()
      } else {
        setError(res.error ?? 'فشل')
      }
    })
  }

  const handleBan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    run(() => banUser(userId, fd))
  }

  const handleTrust = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    run(() => adjustTrust(userId, fd))
  }

  return (
    <div className={styles.actions}>
      {error && (
        <div className={styles.errorBar}>
          <AlertIcon size={14} /> {error}
        </div>
      )}

      <div className={styles.actionRow}>
        {isBanned ? (
          <button
            type="button"
            onClick={() => run(() => unbanUser(userId))}
            disabled={pending}
            className={styles.btnTeal}
          >
            <CheckCircleIcon size={14} /> إلغاء الحظر
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setModal('ban')}
            disabled={pending}
            className={styles.btnDanger}
          >
            <CloseIcon size={14} /> حظر
          </button>
        )}

        <button
          type="button"
          onClick={() => setModal('role')}
          disabled={pending}
          className={styles.btn}
        >
          تغيير الدور
        </button>

        <button
          type="button"
          onClick={() => setModal('trust')}
          disabled={pending}
          className={styles.btn}
        >
          <StarIcon size={14} /> تعديل نقاط المشاركة ({trustScore})
        </button>

        <button
          type="button"
          onClick={() => run(() => togglePremium(userId))}
          disabled={pending}
          className={isPremium ? styles.btnGold : styles.btn}
        >
          <CrownGoldIcon size={14} />
          {isPremium ? 'إلغاء Premium' : 'تفعيل Premium'}
        </button>
      </div>

      {modal === 'ban' && (
        <div className={styles.modalBackdrop} onClick={() => setModal(null)}>
          <form className={styles.modal} onClick={(e) => e.stopPropagation()} onSubmit={handleBan}>
            <h3 className={styles.modalTitle}>حظر المستخدم</h3>
            <label className={styles.field}>
              <span className={styles.label}>عدد الأيام</span>
              <input
                type="number"
                name="days"
                min={1}
                max={3650}
                defaultValue={30}
                required
                className={styles.input}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>سبب الحظر</span>
              <textarea
                name="reason"
                required
                minLength={5}
                maxLength={300}
                rows={3}
                className={styles.textarea}
                dir="rtl"
              />
            </label>
            <div className={styles.modalActions}>
              <button type="button" onClick={() => setModal(null)} className={styles.btn}>
                إلغاء
              </button>
              <button type="submit" disabled={pending} className={styles.btnDanger}>
                تأكيد
              </button>
            </div>
          </form>
        </div>
      )}

      {modal === 'role' && (
        <div className={styles.modalBackdrop} onClick={() => setModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>تغيير الدور (الحالي: {getRoleLabel(currentRole)})</h3>
            <div className={styles.roleGrid}>
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => run(() => changeUserRole(userId, r.value))}
                  disabled={pending || r.value === currentRole}
                  className={`${styles.roleBtn} ${r.value === currentRole ? styles.roleBtnActive : ''}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <div className={styles.modalActions}>
              <button type="button" onClick={() => setModal(null)} className={styles.btn}>
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {modal === 'trust' && (
        <div className={styles.modalBackdrop} onClick={() => setModal(null)}>
          <form
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleTrust}
          >
            <h3 className={styles.modalTitle}>تعديل نقاط المشاركة (الحالي: {trustScore})</h3>
            <label className={styles.field}>
              <span className={styles.label}>الفرق (-100 إلى +100)</span>
              <input
                type="number"
                name="delta"
                min={-100}
                max={100}
                defaultValue={5}
                required
                className={styles.input}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>السبب</span>
              <input
                type="text"
                name="reason"
                required
                minLength={3}
                maxLength={200}
                className={styles.input}
                dir="rtl"
              />
            </label>
            <div className={styles.modalActions}>
              <button type="button" onClick={() => setModal(null)} className={styles.btn}>
                إلغاء
              </button>
              <button type="submit" disabled={pending} className={styles.btnGold}>
                تعديل
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
