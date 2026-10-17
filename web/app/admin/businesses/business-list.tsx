'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircleIcon, CloseIcon, AlertIcon } from '@/components/icons'
import { bulkApproveBusinesses, bulkRejectBusinesses, bulkArchiveBusinesses } from './bulk-actions'
import BusinessRow from './business-row'
import type { PendingBusiness } from '@/lib/data/admin'
import styles from './businesses.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Business List (Bulk Selection + Toolbar)
// ═══════════════════════════════════════════════════════════

type Props = {
  businesses: PendingBusiness[]
  status: 'pending' | 'published' | 'rejected' | 'admin_owned' | 'all'
}

export default function BusinessList({ businesses, status }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [showReject, setShowReject] = useState(false)
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set())

  const visibleBusinesses = businesses.filter((b) => !removedIds.has(b.id))

  const allSelected = visibleBusinesses.length > 0 && selected.size === visibleBusinesses.length
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
    else setSelected(new Set(visibleBusinesses.map((b) => b.id)))
  }

  const clearSelection = () => setSelected(new Set())

  const run = (
    fn: () => Promise<{ ok: boolean; error?: string; affected?: number }>,
    optimisticIds?: string[],
  ) => {
    setError(null)
    if (optimisticIds && optimisticIds.length > 0) {
      setRemovedIds((prev) => new Set([...prev, ...optimisticIds]))
    }
    startTransition(async () => {
      const res = await fn()
      if (res.ok) {
        clearSelection()
        router.refresh()
      } else {
        if (optimisticIds) {
          setRemovedIds((prev) => {
            const next = new Set(prev)
            for (const id of optimisticIds) next.delete(id)
            return next
          })
        }
        setError(res.error ?? 'فشل')
      }
    })
  }

  const handleBulkApprove = () => {
    if (!confirm(`موافقة على ${selected.size} نشاط؟`)) return
    run(() => bulkApproveBusinesses(Array.from(selected)), Array.from(selected))
  }

  const handleBulkArchive = () => {
    if (!confirm(`إخفاء ${selected.size} نشاط من المنصة؟`)) return
    run(() => bulkArchiveBusinesses(Array.from(selected)), Array.from(selected))
  }

  const handleBulkReject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const reason = String(fd.get('reason') ?? '')
    const ids = Array.from(selected)
    setRemovedIds((prev) => new Set([...prev, ...ids]))
    startTransition(async () => {
      const res = await bulkRejectBusinesses(ids, reason)
      if (res.ok) {
        setShowReject(false)
        clearSelection()
        router.refresh()
      } else {
        setRemovedIds((prev) => {
          const next = new Set(prev)
          for (const id of ids) next.delete(id)
          return next
        })
        setError(res.error)
      }
    })
  }

  // القرار بناءً على الـ status الحالي
  const canApprove = status === 'pending' || status === 'rejected'
  const canReject = status === 'pending'
  const canArchive = status === 'published' || status === 'admin_owned'

  return (
    <>
      {/* Toolbar — sticky top */}
      {someSelected && (
        <div className={styles.bulkToolbar}>
          <div className={styles.bulkToolbarLeft}>
            <span className={styles.bulkCount}>{selected.size} محدّد</span>
            <button type="button" onClick={toggleAll} className={styles.bulkToggleAll}>
              {allSelected ? 'إلغاء التحديد' : 'تحديد الكل'}
            </button>
            <button type="button" onClick={clearSelection} className={styles.bulkClear}>
              <CloseIcon size={12} />
              <span>مسح</span>
            </button>
          </div>

          <div className={styles.bulkToolbarRight}>
            {canApprove && !showReject && (
              <button
                type="button"
                onClick={handleBulkApprove}
                disabled={pending}
                className={styles.approveBtn}
              >
                <CheckCircleIcon size={14} />
                <span>موافقة جماعية</span>
              </button>
            )}

            {canReject && !showReject && (
              <button
                type="button"
                onClick={() => setShowReject(true)}
                disabled={pending}
                className={styles.dangerBtn}
              >
                <CloseIcon size={14} />
                <span>رفض جماعي</span>
              </button>
            )}

            {canArchive && !showReject && (
              <button
                type="button"
                onClick={handleBulkArchive}
                disabled={pending}
                className={styles.secondaryBtn}
              >
                <CloseIcon size={14} />
                <span>إخفاء جماعي</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bulk reject form */}
      {showReject && (
        <form onSubmit={handleBulkReject} className={styles.bulkRejectForm}>
          <p className={styles.bulkRejectLabel}>
            رفض {selected.size} نشاط — اكتب السبب (هيوصل لكل صاحب نشاط):
          </p>
          <textarea
            name="reason"
            required
            minLength={5}
            maxLength={300}
            rows={3}
            placeholder="سبب الرفض (5-300 حرف)..."
            className={styles.rejectInput}
            dir="rtl"
          />
          <div className={styles.rejectActions}>
            <button type="submit" disabled={pending} className={styles.dangerBtn}>
              تأكيد رفض {selected.size} نشاط
            </button>
            <button
              type="button"
              onClick={() => setShowReject(false)}
              disabled={pending}
              className={styles.cancelBtn}
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      {error && (
        <div className={styles.bulkError}>
          <AlertIcon size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* Select All header */}
      {visibleBusinesses.length > 1 && (
        <div className={styles.selectAllRow}>
          <label className={styles.selectAllLabel}>
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              className={styles.checkbox}
            />
            <span>تحديد الكل ({visibleBusinesses.length})</span>
          </label>
        </div>
      )}

      {/* List */}
      <div className={styles.list}>
        {visibleBusinesses.map((b) => (
          <BusinessRow
            key={b.id}
            business={b}
            selected={selected.has(b.id)}
            onToggleSelect={() => toggle(b.id)}
            showCheckbox
          />
        ))}
      </div>
    </>
  )
}
