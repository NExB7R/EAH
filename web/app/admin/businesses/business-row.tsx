'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  StoreIcon,
  CheckCircleIcon,
  CloseIcon,
  ArrowLeftIcon,
  AlertIcon,
  SparklesIcon,
} from '@/components/icons'
import { approveBusiness, rejectBusiness, archiveBusiness, republishBusiness } from './actions'
import type { PendingBusiness } from '@/lib/data/admin'
import { computeBusinessCompleteness, getGradeLabel } from '@/lib/data/business-completeness'
import styles from './businesses.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Business Row (Admin)
// ═══════════════════════════════════════════════════════════

type Props = {
  business: PendingBusiness
  selected?: boolean
  onToggleSelect?: () => void
  showCheckbox?: boolean
}

const TYPE_LABEL: Record<string, string> = {
  restaurant: 'مطعم',
  pharmacy: 'صيدلية',
  delivery_office: 'توصيل',
  misc: 'أخرى',
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return '—'
  }
}

export default function BusinessRow({
  business: b,
  selected = false,
  onToggleSelect,
  showCheckbox = false,
}: Props) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [showReject, setShowReject] = useState(false)

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setError(null)
    startTransition(async () => {
      const res = await fn()
      if (!res.ok) setError(res.error ?? 'فشل')
    })
  }

  const handleApprove = () => run(() => approveBusiness(b.id))
  const handleArchive = () => {
    if (!confirm(`إخفاء "${b.name}" من المنصة؟`)) return
    run(() => archiveBusiness(b.id))
  }
  const handleRepublish = () => run(() => republishBusiness(b.id))

  const handleReject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await rejectBusiness(b.id, formData)
      if (res.ok) {
        setShowReject(false)
      } else {
        setError(res.error)
      }
    })
  }

  const isRejected = !!b.rejected_at
  const status = b.is_published ? 'published' : isRejected ? 'rejected' : 'pending'
  const customType = b.custom_business_type?.trim()
  const typeLabel =
    customType && b.business_type === 'misc' && b.business_type_status === 'approved'
      ? customType
      : (TYPE_LABEL[b.business_type] ?? b.business_type)

  const completeness = computeBusinessCompleteness({
    name: b.name,
    business_type: b.business_type,
    description: b.description,
    hook: b.hook ?? null,
    area: b.area,
    city: b.city ?? null,
    address_text: b.address_text ?? null,
    latitude: b.latitude ?? null,
    longitude: b.longitude ?? null,
    logo_url: b.logo_url ?? null,
    cover_image_url: b.cover_image_url,
    working_hours: b.working_hours ?? null,
    is_verified: b.is_verified ?? false,
    is_published: b.is_published,
    is_open: b.is_open ?? false,
    accepts_orders: b.accepts_orders ?? false,
    accepts_whatsapp_orders: b.accepts_whatsapp_orders ?? false,
    branches_count: b.branches_count ?? 0,
    offers_count: b.offers_count ?? 0,
    rating_count: b.rating_count ?? 0,
  })
  const grade = getGradeLabel(completeness.grade)

  return (
    <div
      className={`${styles.card} ${pending ? styles.pending : ''} ${selected ? styles.cardSelected : ''}`}
    >
      {showCheckbox && (
        <label className={styles.cardCheckbox}>
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            aria-label={`تحديد ${b.name}`}
          />
        </label>
      )}
      <div className={styles.imageWrap}>
        {b.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={b.cover_image_url} alt={b.name} className={styles.image} />
        ) : (
          <div className={styles.imageFallback}>
            <StoreIcon size={32} />
          </div>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.bodyHead}>
          <div className={styles.nameRow}>
            <h3 className={styles.name}>{b.name}</h3>
            <Link
              href={`/admin/businesses/${b.id}`}
              className={`${styles.completenessBadge} ${styles[`completeness_${completeness.grade}`]}`}
              title={
                completeness.missing.length > 0
                  ? `ناقص ${completeness.missing.length}: ${completeness.missing
                      .slice(0, 4)
                      .map((m) => m.label)
                      .join(' · ')}`
                  : 'مكتمل 100%'
              }
              aria-label={`اكتمال ${completeness.percent}% — اضغط للتفاصيل`}
            >
              {completeness.percent}%
            </Link>
          </div>
          <div className={styles.badges}>
            <span className={`${styles.status} ${styles[`status_${status}`]}`}>
              {status === 'pending' && 'بانتظار'}
              {status === 'published' && 'منشور'}
              {status === 'rejected' && 'مرفوض'}
            </span>
            {b.business_type_status === 'pending' && (
              <span className={styles.status + ' ' + styles.status_pending}>
                نوع النشاط بحاجة موافقة
              </span>
            )}
            {b.business_type_status === 'rejected' && (
              <span className={styles.status + ' ' + styles.status_rejected}>نوع النشاط مرفوض</span>
            )}
            <span
              className={`${styles.sourceChip} ${b.source === 'admin' ? styles.sourceAdmin : ''}`}
            >
              {b.source === 'admin' ? 'بإدارة الأدمن' : 'بإدارة التاجر'}
            </span>
          </div>
        </div>

        <div className={styles.meta}>
          <span>{typeLabel}</span>
          {customType && b.business_type_status !== 'approved' && (
            <>
              <span className={styles.dot}>·</span>
              <span>النوع المقترح: {customType}</span>
            </>
          )}
          {b.area && (
            <>
              <span className={styles.dot}>·</span>
              <span>{b.area}</span>
            </>
          )}
          <span className={styles.dot}>·</span>
          <span>{formatDate(b.created_at)}</span>
        </div>

        {b.owner && (
          <div className={styles.owner}>
            <span>👤 {b.owner.display_name}</span>
            {b.owner.phone && <span className={styles.phone}>· {b.owner.phone}</span>}
          </div>
        )}

        {b.description && <p className={styles.desc}>{b.description.slice(0, 200)}</p>}

        {isRejected && b.rejection_reason && (
          <div className={styles.rejectionBox}>
            <AlertIcon size={14} />
            <span>سبب الرفض: {b.rejection_reason}</span>
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}

        {showReject ? (
          <form onSubmit={handleReject} className={styles.rejectForm}>
            <textarea
              name="reason"
              required
              minLength={5}
              maxLength={300}
              rows={2}
              placeholder="سبب الرفض (5-300 حرف)..."
              className={styles.rejectInput}
              dir="rtl"
            />
            <div className={styles.rejectActions}>
              <button type="submit" disabled={pending} className={styles.dangerBtn}>
                تأكيد الرفض
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
        ) : (
          <div className={styles.actions}>
            {status === 'pending' && (
              <>
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={pending}
                  className={styles.approveBtn}
                >
                  <CheckCircleIcon size={14} />
                  <span>موافقة ونشر</span>
                </button>
                {b.business_type_status === 'pending' && (
                  <Link href="/admin/business-types" className={styles.viewBtn}>
                    <SparklesIcon size={14} />
                    <span>مراجعة نوع النشاط</span>
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => setShowReject(true)}
                  disabled={pending}
                  className={styles.dangerBtn}
                >
                  <CloseIcon size={14} />
                  <span>رفض</span>
                </button>
              </>
            )}

            {status === 'published' && (
              <>
                {b.business_type_status === 'pending' && (
                  <Link href="/admin/business-types" className={styles.viewBtn}>
                    <SparklesIcon size={14} />
                    <span>مراجعة نوع النشاط</span>
                  </Link>
                )}
                {b.business_type_status === 'rejected' && (
                  <Link href={'/admin/businesses/' + b.id + '?tab=edit'} className={styles.viewBtn}>
                    <SparklesIcon size={14} />
                    <span>تصحيح نوع النشاط</span>
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleArchive}
                  disabled={pending}
                  className={styles.secondaryBtn}
                >
                  <CloseIcon size={14} />
                  <span>إخفاء مؤقت</span>
                </button>
              </>
            )}

            {status === 'rejected' && (
              <>
                <button
                  type="button"
                  onClick={handleRepublish}
                  disabled={pending}
                  className={styles.approveBtn}
                >
                  <CheckCircleIcon size={14} />
                  <span>إعادة نشر</span>
                </button>
                {b.business_type_status === 'pending' && (
                  <Link href="/admin/business-types" className={styles.viewBtn}>
                    <SparklesIcon size={14} />
                    <span>مراجعة نوع النشاط</span>
                  </Link>
                )}
                {b.business_type_status === 'rejected' && (
                  <Link href={'/admin/businesses/' + b.id + '?tab=edit'} className={styles.viewBtn}>
                    <SparklesIcon size={14} />
                    <span>تصحيح نوع النشاط</span>
                  </Link>
                )}
              </>
            )}

            <Link href={`/admin/businesses/${b.id}`} className={styles.viewBtn}>
              <span>تفاصيل</span>
              <ArrowLeftIcon size={14} />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
