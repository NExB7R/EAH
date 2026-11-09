import Link from 'next/link'
import {
  CheckCircleIcon,
  AlertIcon,
  SparklesIcon,
} from '@/components/icons'
import { computeBusinessCompleteness, getGradeLabel } from '@/lib/data/business-completeness'
import type { AdminBusiness } from '@/lib/data/admin-business'
import styles from './completeness-panel.module.css'

type Props = {
  biz: AdminBusiness
}

const SECTION_MAP: Record<string, string> = {
  logo: 'images',
  cover: 'images',
  hours: 'hours',
  description: 'basics',
  address: 'location',
  area: 'location',
  coords: 'location',
  verified: 'settings',
  orders: 'order-settings',
  offers: 'offers',
  reviews: 'reviews',
  branches: 'branches',
}

export default function CompletenessPanel({ biz }: Props) {
  const data = {
    name: biz.name,
    business_type: biz.business_type,
    description: biz.description,
    hook: biz.hook,
    area: biz.area,
    city: biz.city,
    address_text: biz.address_text,
    latitude: biz.latitude,
    longitude: biz.longitude,
    logo_url: biz.logo_url,
    cover_image_url: biz.cover_image_url,
    working_hours: biz.working_hours as Record<string, unknown> | null,
    is_verified: biz.is_verified,
    is_published: biz.is_published,
    is_open: biz.is_open,
    accepts_orders: biz.accepts_orders,
    accepts_whatsapp_orders: biz.accepts_whatsapp_orders,
    branches_count: biz.branches_count,
    offers_count: biz.offers_count,
    rating_count: biz.rating_count,
  }

  const result = computeBusinessCompleteness(data)
  const grade = getGradeLabel(result.grade)

  return (
    <section className={styles.panel}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.icon}>
            <SparklesIcon size={16} />
          </span>
          <div>
            <h2 className={styles.title}>اكتمال النشاط</h2>
            <p className={styles.subtitle}>
              {result.doneCount} من {result.totalItems} معيار مكتمل
            </p>
          </div>
        </div>
        <div className={styles.percentBadge} style={{ color: grade.color }}>
          {result.percent}%
          <span className={styles.gradeLabel}>{grade.label}</span>
        </div>
      </header>

      {/* Progress Bar */}
      <div className={styles.progressTrack}>
        <div
          className={styles.progressFill}
          style={{
            width: `${result.percent}%`,
            background: `linear-gradient(90deg, ${grade.color}, ${grade.color}cc)`,
          }}
        />
      </div>

      {/* Missing Items */}
      {result.missing.length > 0 ? (
        <div className={styles.missingSection}>
          <h3 className={styles.missingTitle}>ناقص ({result.missing.length})</h3>
          <ul className={styles.missingList}>
            {result.missing.map((item) => {
              const section = SECTION_MAP[item.id]
              const href = section
                ? `/admin/businesses/${biz.id}?tab=edit&section=${section}`
                : `/admin/businesses/${biz.id}?tab=edit`
              return (
                <li key={item.id} className={styles.missingItem}>
                  <span className={styles.missingIcon}>
                    <AlertIcon size={14} />
                  </span>
                  <div className={styles.missingBody}>
                    <span className={styles.missingLabel}>{item.label}</span>
                    {item.hint && <span className={styles.missingHint}>{item.hint}</span>}
                  </div>
                  <Link href={href} className={styles.missingLink}>
                    أضف
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ) : (
        <div className={styles.allDone}>
          <CheckCircleIcon size={20} />
          <span>النشاط مكتمل 100% — جاهز للجمهور!</span>
        </div>
      )}
    </section>
  )
}
