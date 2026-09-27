import Link from 'next/link'
import {
  CrownGoldIcon,
  TrendingUpIcon,
  StoreIcon,
  GiftIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  SparklesIcon,
  ShieldCheckIcon,
} from './icons'
import type { SubscriptionPlan, PlanFeatureKey } from '@/lib/data/subscriptions'
import { FEATURE_LABEL } from '@/lib/data/subscriptions'
import styles from './plan-card.module.css'

type Props = {
  plan: SubscriptionPlan
  featured?: boolean
}

const PLAN_ICON: Record<string, typeof CrownGoldIcon> = {
  basic: GiftIcon,
  featured_monthly: CrownGoldIcon,
  featured_quarterly: TrendingUpIcon,
  featured_yearly: StoreIcon,
}

const PLAN_TAGLINE: Record<string, string> = {
  basic: 'كل ده مجاناً — للأبد',
  featured_monthly: 'البداية الصح',
  featured_quarterly: 'الأكثر اختياراً',
  featured_yearly: 'كل حاجة بدون حدود',
}

export default function PlanCard({ plan, featured = false }: Props) {
  const Icon = PLAN_ICON[plan.code] ?? CrownGoldIcon
  const tagline = PLAN_TAGLINE[plan.code]
  const isFree = plan.price_egp === 0

  return (
    <div className={`${styles.card} ${featured ? styles.featured : ''} ${isFree ? styles.free : ''}`}>
      {featured && <span className={styles.ribbon}>الأكثر اختياراً</span>}
      {isFree && <span className={styles.freeRibbon}>مجاناً للأبد</span>}

      <div className={styles.head}>
        <span className={styles.icon}>
          <Icon size={26} />
        </span>
        <h3 className={styles.name}>{plan.name_ar}</h3>
        {tagline && <p className={styles.tagline}>{tagline}</p>}
        {plan.description && (
          <p className={styles.desc}>{plan.description}</p>
        )}
      </div>

      <div className={styles.priceWrap}>
        {isFree ? (
          <span className={styles.priceFree}>
            <SparklesIcon size={22} />
            0 ج.م
          </span>
        ) : (
          <>
            <span className={styles.price}>{plan.price_egp}</span>
            <span className={styles.currency}>ج.م</span>
            <span className={styles.period}>/ شهر</span>
          </>
        )}
      </div>

      {plan.trial_days > 0 && !isFree && (
        <div className={styles.trial}>
          ✨ {plan.trial_days} يوم تجربة مجانية
        </div>
      )}

      {isFree && (
        <div className={styles.freeNote}>
          من غير بطاقة — من غير التزام — من غير رغي
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
        <span>{isFree ? 'ابدأ مجاناً' : 'ابدأ التجربة'}</span>
        <ArrowLeftIcon size={16} />
      </Link>
    </div>
  )
}
