'use client'

import { CheckCircleIcon, ChevronLeftIcon } from '@/components/icons'
import { SECTION_META, type SectionKey } from './business-form-config'
import styles from './business-form.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Admin Business Form: Shared UI primitives
// ═══════════════════════════════════════════════════════════

export function Section({
  sectionKey,
  title,
  Icon,
  open,
  onToggle,
  saved,
  children,
}: {
  sectionKey: SectionKey
  title?: string
  Icon?: React.ComponentType<{ size?: number }>
  open: boolean
  onToggle: () => void
  saved?: boolean
  children: React.ReactNode
}) {
  const meta = SECTION_META[sectionKey]
  const displayTitle = title ?? meta.title
  const DisplayIcon = Icon ?? meta.Icon

  return (
    <section className={styles.section} data-open={open}>
      <button type="button" className={styles.sectionHead} onClick={onToggle} aria-expanded={open}>
        <span className={styles.sectionIcon}>
          <DisplayIcon size={16} />
        </span>
        <span className={styles.sectionTitle}>{displayTitle}</span>
        {saved && (
          <span className={styles.saved}>
            <CheckCircleIcon size={12} /> تم
          </span>
        )}
        <ChevronLeftIcon size={14} className={styles.sectionChev} />
      </button>
      {open && <div className={styles.sectionBody}>{children}</div>}
    </section>
  )
}

export function SaveBar({
  onClick,
  pending,
  saved,
  label,
}: {
  onClick: () => void
  pending: boolean
  saved: boolean
  label?: string
}) {
  return (
    <div className={styles.saveBar}>
      <button type="button" className={styles.saveBtn} onClick={onClick} disabled={pending}>
        {pending ? 'جاري الحفظ...' : (label ?? 'حفظ القسم')}
      </button>
      {saved && (
        <span className={styles.saved}>
          <CheckCircleIcon size={12} /> تم الحفظ
        </span>
      )}
    </div>
  )
}
