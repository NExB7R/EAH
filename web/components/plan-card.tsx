import Link from 'next/link'
import {
  CrownGoldIcon,
  TrendingUpIcon,
  StoreIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
} from './icons'
import type { SubscriptionPlan, PlanFeatureKey } from '@/lib/data/subscriptions'
import { FEATURE_LABEL } from '@/lib/data/subscriptions'
import styles from './plan-card.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Plan Card
// ═══════════════════════════════════════════════════════════

type Props = {
  plan: SubscriptionPlan
  featured?: boolean
}

const PLAN_ICON: Record<string, typeof CrownGoldIcon> = {
  featured_monthly: CrownGoldIcon,
  featured_quarterly: TrendingUpIcon,
  featured_yearly: StoreIcon,
}

export default function PlanCard({ plan, featured = false }: Props) {
  const Icon = PLAN_ICON[plan.code] ?? CrownGoldIcon

  return (
    <div className={`${styles.card} ${featured ? styles.featured : ''}`}>
      {featured && <span className={styles.ribbon}>الأكثر اختياراً</span>}

      <div className={styles.head}>
        <span className={styles.icon}>
          <Icon size={26} />
        </span>
        <h3 className={styles.name}>{plan.name_ar}</h3>
        {plan.description && (
          <p className={styles.desc}>{plan.description}</p>
        )}
      </div>

      <div className={styles.priceWrap}>
        <span className={styles.price}>{plan.price_egp}</span>
        <span className={styles.currency}>ج.م</span>
        <span className={styles.period}>/ شهر</span>
      </div>

      {plan.trial_days > 0 && (
        <div className={styles.trial}>
          ✨ {plan.trial_days} يوم تجربة مجانية
        </div>
      )}

      <ul className={styles.features}>
        {plan.features.map((key: PlanFeatureKey) => (
          <li key={key} className={styles.feature}>
            <CheckCircleIcon size={16} />
            <span>{FEATURE_LABEL[key]}</span>
          </li>
        ))}
      </ul>

      <Link href="/merchant/apply" className={styles.cta}>
        <span>ابدأ التجربة</span>
        <ArrowLeftIcon size={16} />
      </Link>
    </div>
  )
}
