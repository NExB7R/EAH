'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  GiftIcon,
  AlertIcon,
  CheckCircleIcon,
  UserIcon,
  PhoneIcon,
  CloseIcon,
} from '@/components/icons'
import {
  adminStartTrial,
  findUserByPhone,
  linkBusinessToUser,
  unlinkBusinessOwner,
} from '../actions'
import styles from './trial-owner-panel.module.css'

// ═══════════════════════════════════════════════════════════
// Admin Panel — إدارة التجربة + ربط المالك
// ═══════════════════════════════════════════════════════════

type UserFound = {
  id: string
  displayName: string
  phone: string
  role: string
  businessesCount: number
}

type Props = {
  businessId: string
  businessName: string
  ownerProfileId: string | null
  ownerDisplayName: string | null
  ownerPhone: string | null
  source: 'merchant' | 'admin' | string
  trialUsed: boolean
}

const ROLE_LABEL: Record<string, string> = {
  customer: 'المشتري',
  merchant: 'البايع',
  admin: 'أدمن',
  super_admin: 'سوبر أدمن',
}

export default function TrialOwnerPanel({
  businessId,
  businessName,
  ownerProfileId,
  ownerDisplayName,
  ownerPhone,
  source,
  trialUsed,
}: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // ربط
  const [phoneInput, setPhoneInput] = useState('')
  const [userFound, setUserFound] = useState<UserFound | null>(null)
  const [searching, setSearching] = useState(false)

  const reset = () => {
    setError(null)
    setSuccess(null)
  }

  const runAction = (fn: () => Promise<{ ok: boolean; error?: string }>, okMsg: string) => {
    reset()
    startTransition(async () => {
      const res = await fn()
      if (res.ok) {
        setSuccess(okMsg)
        router.refresh()
      } else {
        setError(res.error ?? 'فشل')
      }
    })
  }

  const handleStartTrial = () => {
    if (trialUsed) return
    if (!confirm(`تبدأ تجربة 30 يوم على "المميزة" للنشاط "${businessName}"؟`)) return
    runAction(() => adminStartTrial(businessId, 30), 'التجربة بدأت — 30 يوم على المميزة')
  }

  const handleSearch = async () => {
    reset()
    setUserFound(null)
    if (!phoneInput.trim()) {
      setError('اكتب رقم الموبايل')
      return
    }
    setSearching(true)
    const res = await findUserByPhone(phoneInput)
    setSearching(false)
    if (res.ok) {
      setUserFound(res.user)
    } else {
      setError(res.error)
    }
  }

  const handleLink = () => {
    if (!userFound) return
    if (
      !confirm(
        `تربط النشاط "${businessName}" بالحساب "${userFound.displayName}" (${userFound.phone})؟`,
      )
    ) {
      return
    }
    runAction(
      () => linkBusinessToUser(businessId, userFound.id),
      'تم الربط — المستخدم هيشوف النشاط في لوحته',
    )
    setUserFound(null)
    setPhoneInput('')
  }

  const handleUnlink = () => {
    if (!confirm('فك ارتباط النشاط بالحساب الحالي؟ النشاط هيرجع تحت إدارة الأدمن.')) return
    runAction(() => unlinkBusinessOwner(businessId), 'تم فك الارتباط')
  }

  return (
    <div className={styles.panel}>
      {/* ─── الحالة الحالية ─── */}
      <div className={styles.statusBar}>
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>المصدر</span>
          <span
            className={`${styles.chip} ${source === 'admin' ? styles.chipAdmin : styles.chipMerchant}`}
          >
            {source === 'admin' ? 'الأدمن' : 'البايع'}
          </span>
        </div>
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>التجربة</span>
          <span className={`${styles.chip} ${trialUsed ? styles.chipUsed : styles.chipAvailable}`}>
            {trialUsed ? 'مستخدمة' : 'متاحة'}
          </span>
        </div>
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>المالك</span>
          <span className={styles.ownerText}>{ownerDisplayName ?? '— غير مربوط —'}</span>
        </div>
      </div>

      {/* ─── التجربة المجانية ─── */}
      {!trialUsed && (
        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionIcon}>
              <GiftIcon size={18} />
            </span>
            <div>
              <strong className={styles.sectionTitle}>ابدأ تجربة مجانية 30 يوم</strong>
              <p className={styles.sectionDesc}>
                الباقة المميزة — ظهور في الرئيسية + شارة + إحصائيات كاملة
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleStartTrial}
            disabled={pending}
            className={styles.primaryBtn}
          >
            {pending ? '...' : 'ابدأ التجربة'}
          </button>
        </div>
      )}

      {/* ─── ربط بحساب ─── */}
      {!ownerProfileId && (
        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionIcon}>
              <UserIcon size={18} />
            </span>
            <div>
              <strong className={styles.sectionTitle}>اربط النشاط بحساب</strong>
              <p className={styles.sectionDesc}>
                ادخل رقم الموبايل المسجل — هيظهر المستخدم قبل التأكيد
              </p>
            </div>
          </div>

          <div className={styles.searchRow}>
            <input
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="01xxxxxxxxx"
              className={styles.input}
              dir="ltr"
              maxLength={11}
              disabled={pending || searching}
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={pending || searching || !phoneInput.trim()}
              className={styles.secondaryBtn}
            >
              <PhoneIcon size={14} />
              <span>{searching ? '...' : 'ابحث'}</span>
            </button>
          </div>

          {userFound && (
            <div className={styles.userCard}>
              <div className={styles.userInfo}>
                <div className={styles.userName}>{userFound.displayName}</div>
                <div className={styles.userMeta}>
                  <span dir="ltr">{userFound.phone}</span>
                  <span className={styles.dot}>·</span>
                  <span>{ROLE_LABEL[userFound.role] ?? userFound.role}</span>
                  <span className={styles.dot}>·</span>
                  <span>{userFound.businessesCount} نشاط</span>
                </div>
              </div>
              <div className={styles.userActions}>
                <button
                  type="button"
                  onClick={handleLink}
                  disabled={pending}
                  className={styles.primaryBtnSm}
                >
                  <CheckCircleIcon size={14} />
                  <span>تأكيد الربط</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserFound(null)
                    setPhoneInput('')
                  }}
                  disabled={pending}
                  className={styles.ghostBtn}
                >
                  <CloseIcon size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── فك ارتباط ─── */}
      {ownerProfileId && (
        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionIcon}>
              <UserIcon size={18} />
            </span>
            <div>
              <strong className={styles.sectionTitle}>
                المالك الحالي: {ownerDisplayName ?? '—'}
              </strong>
              {ownerPhone && (
                <p className={styles.sectionDesc} dir="ltr">
                  {ownerPhone}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleUnlink}
            disabled={pending}
            className={styles.dangerBtn}
          >
            فك الارتباط
          </button>
        </div>
      )}

      {/* ─── رسائل ─── */}
      {error && (
        <div className={styles.error}>
          <AlertIcon size={14} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className={styles.success}>
          <CheckCircleIcon size={14} />
          <span>{success}</span>
        </div>
      )}
    </div>
  )
}
