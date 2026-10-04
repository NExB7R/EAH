'use client'

import { useState, useTransition } from 'react'
import {
  MapPinIcon,
  PhoneIcon,
  WhatsAppIcon,
  CrownGoldIcon,
  CheckIcon,
  CloseIcon,
} from '@/components/icons'
import { deleteBranch, setPrimaryBranch, toggleBranchActive } from './actions'
import BranchForm from './branch-form'
import type { BranchRow as BranchRowType } from './types'
import styles from './branches.module.css'

type Props = {
  branch: BranchRowType
}

export default function BranchRow({ branch }: Props) {
  const [editing, setEditing] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleDelete = () => {
    if (!confirm(`تأكيد حذف فرع "${branch.name}"؟`)) return
    setError(null)
    startTransition(async () => {
      const res = await deleteBranch(branch.id)
      if (!res.ok) setError(res.error)
    })
  }

  const handlePrimary = () => {
    if (branch.is_primary) return
    setError(null)
    startTransition(async () => {
      const res = await setPrimaryBranch(branch.id)
      if (!res.ok) setError(res.error)
    })
  }

  const handleToggle = () => {
    setError(null)
    startTransition(async () => {
      const res = await toggleBranchActive(branch.id, !branch.is_active)
      if (!res.ok) setError(res.error)
    })
  }

  if (editing) {
    return (
      <div className={styles.editWrap}>
        <BranchForm branch={branch} onDone={() => setEditing(false)} />
      </div>
    )
  }

  return (
    <div
      className={`${styles.branch} ${branch.is_primary ? styles.primary : ''} ${
        !branch.is_active ? styles.inactive : ''
      } ${pending ? styles.pending : ''}`}
    >
      <div className={styles.branchHead}>
        <h3 className={styles.branchName}>{branch.name}</h3>

        {branch.is_primary && (
          <span className={styles.primaryBadge}>
            <CrownGoldIcon size={12} />
            <span>الفرع الأساسي</span>
          </span>
        )}

        {!branch.is_active && <span className={styles.inactiveBadge}>موقوف</span>}
      </div>

      <div className={styles.branchMeta}>
        <span className={styles.meta}>
          <MapPinIcon size={12} />
          <span>{branch.area}</span>
          {branch.address_text && <span className={styles.dot}>·</span>}
          {branch.address_text && <span>{branch.address_text}</span>}
        </span>

        {branch.phone && (
          <a href={`tel:${branch.phone}`} className={styles.meta}>
            <PhoneIcon size={12} />
            <span>{branch.phone}</span>
          </a>
        )}

        {branch.whatsapp && (
          <a
            href={`https://wa.me/${branch.whatsapp.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener"
            className={styles.meta}
          >
            <WhatsAppIcon size={12} />
            <span>{branch.whatsapp}</span>
          </a>
        )}

        {branch.latitude !== null && branch.longitude !== null && (
          <span className={styles.coords}>
            {branch.latitude.toFixed(4)}, {branch.longitude.toFixed(4)}
          </span>
        )}
      </div>

      {error && <p className={styles.rowError}>{error}</p>}

      <div className={styles.branchActions}>
        {!branch.is_primary && (
          <button
            type="button"
            onClick={handlePrimary}
            disabled={pending}
            className={styles.actionBtn}
            title="خليه الفرع الأساسي"
          >
            <CrownGoldIcon size={14} />
            <span>خليه أساسي</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setEditing(true)}
          disabled={pending}
          className={styles.actionBtn}
        >
          <span>تعديل</span>
        </button>

        <button
          type="button"
          onClick={handleToggle}
          disabled={pending}
          className={styles.actionBtn}
        >
          {branch.is_active ? (
            <>
              <CloseIcon size={14} />
              <span>إيقاف</span>
            </>
          ) : (
            <>
              <CheckIcon size={14} />
              <span>تنشيط</span>
            </>
          )}
        </button>

        {!branch.is_primary && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className={`${styles.actionBtn} ${styles.danger}`}
          >
            <CloseIcon size={14} />
            <span>حذف</span>
          </button>
        )}
      </div>
    </div>
  )
}
