'use client'

import { useState, useTransition } from 'react'
import {
  StarIcon,
  ShieldCheckIcon,
  AlertIcon,
  UserIcon,
  CrownGoldIcon,
  CloseIcon,
  CheckIcon,
} from '@/components/icons'
import Avatar from '@/components/avatar'
import { banUser, unbanUser, changeUserRole, adjustTrust, togglePremium } from './actions'
import type { AdminUser } from './types'
import styles from './users.module.css'
import { getTrustTierMeta } from '@/lib/trust'

type Props = {
  user: AdminUser
  selected?: boolean
  onToggleSelect?: () => void
  showCheckbox?: boolean
}

const ROLE_LABEL: Record<string, string> = {
  customer: 'العميل',
  merchant: 'التاجر',
  admin: 'غير محدد',
  super_admin: 'الأدمن',
}

const ROLES = ['customer', 'merchant'] as const

export default function UserRow({
  user: u,
  selected = false,
  onToggleSelect,
  showCheckbox = false,
}: Props) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [modal, setModal] = useState<null | 'ban' | 'trust' | 'role'>(null)

  const isBanned = !!u.banned_until && new Date(u.banned_until) > new Date()
  const joined = new Date(u.created_at).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, onDone?: () => void) => {
    setError(null)
    startTransition(async () => {
      const res = await fn()
      if (res.ok) {
        onDone?.()
      } else {
        setError(res.error ?? 'فشل')
      }
    })
  }

  const handleUnban = () => run(() => unbanUser(u.id))

  const handleBanSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    run(
      () => banUser(u.id, fd),
      () => setModal(null),
    )
  }

  const handleTrustSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    run(
      () => adjustTrust(u.id, fd),
      () => setModal(null),
    )
  }

  const handleRoleChange = (role: string) => {
    if (role === (u.role ?? 'customer')) {
      setModal(null)
      return
    }
    run(
      () => changeUserRole(u.id, role),
      () => setModal(null),
    )
  }

  const handlePremium = () => run(() => togglePremium(u.id))

  return (
    <div
      className={`${styles.card} ${pending ? styles.pending : ''} ${isBanned ? styles.banned : ''} ${selected ? styles.cardSelected : ''}`}
    >
      {showCheckbox && (
        <label className={styles.cardCheckbox}>
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            aria-label={`تحديد ${u.display_name}`}
          />
        </label>
      )}
      <div className={styles.head}>
        <Avatar
          displayName={u.display_name}
          avatarUrl={u.avatar_url}
          role={(u.role as never) ?? 'customer'}
          isVerified={!!u.verified_at}
          isPaidMember={u.is_paid_member}
          size="md"
        />
        <div className={styles.info}>
          <div className={styles.nameRow}>
            <span className={styles.name}>{u.display_name}</span>
            <span className={`${styles.role} ${styles['role_' + (u.role ?? 'customer')]}`}>
              {ROLE_LABEL[u.role ?? 'customer'] ?? 'غير محدد'}
            </span>
            {u.is_premium && (
              <span className={styles.premium}>
                <CrownGoldIcon size={11} />
                مميز
              </span>
            )}
            {isBanned && (
              <span className={styles.bannedBadge}>
                <AlertIcon size={11} />
                محظور
              </span>
            )}
          </div>
          <div className={styles.meta}>
            {u.phone && <span className={styles.phone}>{u.phone}</span>}
            <span className={styles.dot}>·</span>
            <span>نقاط المشاركة: {getTrustTierMeta(u.trust_score).label}</span>
            <span className={styles.dot}>·</span>
            <span>انضم {joined}</span>
          </div>
        </div>
        <span className={styles.trust}>
          <StarIcon size={12} />
          نقاط {u.trust_score}
        </span>
      </div>

      {u.ban_reason && isBanned && (
        <div className={styles.reasonBox}>
          <AlertIcon size={14} />
          <span>{u.ban_reason}</span>
        </div>
      )}

      {error && (
        <div className={styles.error}>
          <AlertIcon size={14} />
          <span>{error}</span>
        </div>
      )}

      {u.role === 'super_admin' ? (
        <div className={styles.protectedNotice} role="note">
          <ShieldCheckIcon size={15} />
          <span>حساب الأدمن الوحيد — حساب محمي لا يمكن حظره أو تغيير دوره من هنا.</span>
        </div>
      ) : (
        <div className={styles.actions}>
          {isBanned ? (
            <button type="button" onClick={handleUnban} disabled={pending} className={styles.okBtn}>
              <CheckIcon size={14} />
              <span>فك الحظر</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setModal('ban')}
              disabled={pending}
              className={styles.dangerBtn}
            >
              <CloseIcon size={14} />
              <span>حظر</span>
            </button>
          )}
  
          <button
            type="button"
            onClick={() => setModal('role')}
            disabled={pending}
            className={styles.actionBtn}
          >
            <UserIcon size={14} />
            <span>تغيير الدور</span>
          </button>
  
          <button
            type="button"
            onClick={() => setModal('trust')}
            disabled={pending}
            className={styles.actionBtn}
          >
            <StarIcon size={14} />
            <span>تعديل الثقة</span>
          </button>
  
          <button
            type="button"
            onClick={handlePremium}
            disabled={pending}
            className={u.is_premium ? styles.premiumActiveBtn : styles.actionBtn}
          >
            <CrownGoldIcon size={14} />
            <span>{u.is_premium ? 'إلغاء المميز' : 'ترقية للمميز'}</span>
          </button>
        </div>
      )}

      {modal === 'ban' && (
        <form onSubmit={handleBanSubmit} className={styles.modalForm}>
          <h4 className={styles.modalTitle}>حظر المستخدم</h4>
          <label className={styles.field}>
            <span>المدة (يوم)</span>
            <select name="days" defaultValue="7" required>
              <option value="1">يوم واحد</option>
              <option value="7">أسبوع</option>
              <option value="30">شهر</option>
              <option value="365">سنة</option>
              <option value="3650">دائم (10 سنين)</option>
            </select>
          </label>
          <label className={styles.field}>
            <span>السبب *</span>
            <textarea
              name="reason"
              required
              minLength={5}
              maxLength={300}
              rows={2}
              placeholder="سبب الحظر..."
              dir="rtl"
            />
          </label>
          <div className={styles.modalActions}>
            <button type="submit" disabled={pending} className={styles.dangerBtn}>
              تأكيد الحظر
            </button>
            <button
              type="button"
              onClick={() => setModal(null)}
              disabled={pending}
              className={styles.cancelBtn}
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      {modal === 'role' && (
        <div className={styles.modalForm}>
          <h4 className={styles.modalTitle}>تغيير الدور</h4>
          <div className={styles.roleGrid}>
            {ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleRoleChange(r)}
                disabled={pending || r === (u.role ?? 'customer')}
                className={`${styles.roleOption} ${
                  r === (u.role ?? 'customer') ? styles.roleOptionActive : ''
                }`}
              >
                {ROLE_LABEL[r]}
              </button>
            ))}
          </div>
          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={() => setModal(null)}
              disabled={pending}
              className={styles.cancelBtn}
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {modal === 'trust' && (
        <form onSubmit={handleTrustSubmit} className={styles.modalForm}>
          <h4 className={styles.modalTitle}>تعديل نقاط المشاركة</h4>
          <label className={styles.field}>
            <span>التغيير (-100 إلى +100)</span>
            <input
              type="number"
              name="delta"
              min={-100}
              max={100}
              defaultValue={0}
              required
              dir="ltr"
            />
          </label>
          <label className={styles.field}>
            <span>السبب *</span>
            <input
              type="text"
              name="reason"
              required
              minLength={3}
              maxLength={200}
              placeholder="سبب التعديل..."
              dir="rtl"
            />
          </label>
          <div className={styles.modalActions}>
            <button type="submit" disabled={pending} className={styles.okBtn}>
              تأكيد
            </button>
            <button
              type="button"
              onClick={() => setModal(null)}
              disabled={pending}
              className={styles.cancelBtn}
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      {u.verified_at && (
        <div className={styles.verifiedNote}>
          <ShieldCheckIcon size={12} />
          <span>
            موثّق منذ{' '}
            {new Date(u.verified_at).toLocaleDateString('ar-EG', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      )}
    </div>
  )
}
