'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CloseIcon, AlertIcon, CheckCircleIcon, CrownGoldIcon } from '@/components/icons'
import { bulkBanUsers, bulkUnbanUsers, bulkChangeRole, bulkTogglePremium } from './bulk-actions'
import UserRow from './user-row'
import type { AdminUser } from './types'
import styles from './users.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Users List (Bulk Selection + Toolbar)
// ═══════════════════════════════════════════════════════════

type Props = {
  users: AdminUser[]
  filter: string
}

type Modal = 'ban' | 'role' | null

const ROLES = [
  { value: 'customer', label: 'المشتري' },
  { value: 'merchant', label: 'البايع' },
  { value: 'admin', label: 'أدمن' },
] as const

export default function UsersList({ users, filter }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [modal, setModal] = useState<Modal>(null)

  const allSelected = users.length > 0 && selected.size === users.length
  const someSelected = selected.size > 0

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (allSelected) setSelected(new Set())
    else setSelected(new Set(users.map((u) => u.id)))
  }

  const clear = () => setSelected(new Set())

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setError(null)
    startTransition(async () => {
      const res = await fn()
      if (res.ok) {
        clear()
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
    const days = Number(fd.get('days') ?? 30)
    const reason = String(fd.get('reason') ?? '')
    run(() => bulkBanUsers(Array.from(selected), days, reason))
  }

  const handleRole = (role: string) => {
    run(() => bulkChangeRole(Array.from(selected), role))
  }

  const handleUnban = () => {
    if (!confirm(`إلغاء حظر ${selected.size} مستخدم؟`)) return
    run(() => bulkUnbanUsers(Array.from(selected)))
  }

  const handlePremiumOn = () => {
    if (!confirm(`تفعيل Premium لـ ${selected.size} مستخدم؟`)) return
    run(() => bulkTogglePremium(Array.from(selected), true))
  }

  const handlePremiumOff = () => {
    if (!confirm(`إلغاء Premium من ${selected.size} مستخدم؟`)) return
    run(() => bulkTogglePremium(Array.from(selected), false))
  }

  return (
    <>
      {/* Toolbar */}
      {someSelected && (
        <div className={styles.bulkToolbar}>
          <div className={styles.bulkToolbarLeft}>
            <span className={styles.bulkCount}>{selected.size} محدّد</span>
            <button type="button" onClick={toggleAll} className={styles.bulkToggleAll}>
              {allSelected ? 'إلغاء التحديد' : 'تحديد الكل'}
            </button>
            <button type="button" onClick={clear} className={styles.bulkClear}>
              <CloseIcon size={12} />
              <span>مسح</span>
            </button>
          </div>

          <div className={styles.bulkToolbarRight}>
            <button
              type="button"
              onClick={() => setModal('ban')}
              disabled={pending}
              className={styles.dangerBtn}
            >
              <CloseIcon size={14} />
              <span>حظر جماعي</span>
            </button>

            <button
              type="button"
              onClick={() => setModal('role')}
              disabled={pending}
              className={styles.approveBtn}
            >
              <CheckCircleIcon size={14} />
              <span>تغيير الدور</span>
            </button>

            {filter === 'banned' && (
              <button
                type="button"
                onClick={handleUnban}
                disabled={pending}
                className={styles.secondaryBtn}
              >
                إلغاء الحظر
              </button>
            )}

            <button
              type="button"
              onClick={handlePremiumOn}
              disabled={pending}
              className={styles.goldBtn}
            >
              <CrownGoldIcon size={14} />
              <span>Premium +</span>
            </button>

            <button
              type="button"
              onClick={handlePremiumOff}
              disabled={pending}
              className={styles.secondaryBtn}
            >
              Premium −
            </button>
          </div>
        </div>
      )}

      {/* Ban modal */}
      {modal === 'ban' && (
        <div className={styles.bulkModalBackdrop} onClick={() => setModal(null)}>
          <form
            className={styles.bulkModal}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleBan}
          >
            <h3 className={styles.bulkModalTitle}>حظر {selected.size} مستخدم</h3>
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
                placeholder="سبب واضح (5-300 حرف)"
                className={styles.textarea}
                dir="rtl"
              />
            </label>
            <div className={styles.bulkModalActions}>
              <button type="button" onClick={() => setModal(null)} className={styles.cancelBtn}>
                إلغاء
              </button>
              <button type="submit" disabled={pending} className={styles.dangerBtn}>
                تأكيد الحظر
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Role modal */}
      {modal === 'role' && (
        <div className={styles.bulkModalBackdrop} onClick={() => setModal(null)}>
          <div className={styles.bulkModal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.bulkModalTitle}>تغيير دور {selected.size} مستخدم</h3>
            <p className={styles.bulkModalText}>اختر الدور الجديد:</p>
            <div className={styles.roleGrid}>
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => handleRole(r.value)}
                  disabled={pending}
                  className={styles.roleBtn}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <div className={styles.bulkModalActions}>
              <button type="button" onClick={() => setModal(null)} className={styles.cancelBtn}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className={styles.bulkError}>
          <AlertIcon size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* Select all row */}
      {users.length > 1 && (
        <div className={styles.selectAllRow}>
          <label className={styles.selectAllLabel}>
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              className={styles.checkbox}
            />
            <span>تحديد الكل ({users.length})</span>
          </label>
        </div>
      )}

      {/* List */}
      <div className={styles.list}>
        {users.map((u) => (
          <UserRow
            key={u.id}
            user={u}
            selected={selected.has(u.id)}
            onToggleSelect={() => toggle(u.id)}
            showCheckbox
          />
        ))}
      </div>
    </>
  )
}
