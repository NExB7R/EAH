import Link from 'next/link'
import type { ReactNode } from 'react'
import { CrownGoldIcon, LockIcon, ArrowLeftIcon } from './icons'
import styles from './paid-gate.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Paid Gate
// يظهر للأقسام المدفوعة — اللي مش مشترك يشوف blur + زر ترقية
// ═══════════════════════════════════════════════════════════

type Props = {
  children: ReactNode
  hasAccess: boolean
  featureName: string
  featureDesc?: string
  requiredPlan?: string
}

export default function PaidGate({
  children,
  hasAccess,
  featureName,
  featureDesc,
  requiredPlan = 'الباقة المميزة',
}: Props) {
  if (hasAccess) return <>{children}</>

  return (
    <div className={styles.wrap}>
      {/* معاينة blurred */}
      <div className={styles.preview} aria-hidden>
        {children}
      </div>

      {/* Overlay */}
      <div className={styles.overlay}>
        <span className={styles.lock}>
          <LockIcon size={28} />
        </span>
        <span className={styles.badge}>
          <CrownGoldIcon size={12} />
          ميزة مدفوعة
        </span>
        <h3 className={styles.title}>{featureName}</h3>
        {featureDesc && <p className={styles.desc}>{featureDesc}</p>}
        <Link href="/pricing" className={styles.cta}>
          <span>رقّي لـ {requiredPlan}</span>
          <ArrowLeftIcon size={14} />
        </Link>
      </div>
    </div>
  )
}
