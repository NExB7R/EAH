import Link from 'next/link'
import {
  StoreIcon,
  CrownGoldIcon,
  FileTextIcon,
  StarIcon,
  UserIcon,
  AlertIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  TrendingUpIcon,
  GiftIcon,
  ShieldCheckIcon,
} from '@/components/icons'
import { getAdminStats, getAdminRecent } from '@/lib/data/admin'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

type Card = {
  key: string
  label: string
  value: number | string
  Icon: React.ComponentType<{ size?: number }>
  tone: 'purple' | 'orange' | 'teal' | 'gold' | 'pink'
  href?: string
  hint?: string
}

export default async function AdminDashboard() {
  const [stats, recent] = await Promise.all([getAdminStats(), getAdminRecent()])

  const CARDS: Card[] = [
    {
      key: 'total',
      label: 'كل الأنشطة',
      value: stats.totalBusinesses,
      Icon: StoreIcon,
      tone: 'purple',
    },
    {
      key: 'pending',
      label: 'بحاجة موافقة',
      value: stats.pendingBusinesses,
      Icon: AlertIcon,
      tone: 'orange',
      href: '/admin/businesses',
      hint: 'راجعهم',
    },
    {
      key: 'published',
      label: 'منشور',
      value: stats.publishedBusinesses,
      Icon: CheckCircleIcon,
      tone: 'teal',
    },
    {
      key: 'users',
      label: 'المستخدمين',
      value: stats.totalUsers,
      Icon: UserIcon,
      tone: 'purple',
      href: '/admin/users',
    },
    {
      key: 'orders',
      label: 'الطلبات',
      value: stats.totalOrders,
      Icon: FileTextIcon,
      tone: 'gold',
      href: '/admin/analytics',
    },
    {
      key: 'reviews',
      label: 'التقييمات',
      value: stats.totalReviews,
      Icon: StarIcon,
      tone: 'gold',
      href: '/admin/moderation',
    },
  ]

  const QUICK_LINKS = [
    { href: '/admin/businesses', label: 'إدارة الأنشطة', Icon: StoreIcon },
    { href: '/admin/users', label: 'إدارة المستخدمين', Icon: UserIcon },
    { href: '/admin/subscriptions', label: 'الاشتراكات', Icon: CrownGoldIcon },
    { href: '/admin/ads', label: 'الإعلانات', Icon: GiftIcon },
    { href: '/admin/moderation', label: 'المراجعة', Icon: ShieldCheckIcon },
    { href: '/admin/analytics', label: 'التحليلات', Icon: TrendingUpIcon },
  ]

  return (
    <div className={styles.wrap}>
      {/* Alerts */}
      {stats.pendingBusinesses > 0 && (
        <Link href="/admin/businesses" className={styles.alert}>
          <span className={styles.alertIcon}>
            <AlertIcon size={22} />
          </span>
          <div className={styles.alertBody}>
            <strong>عندك {stats.pendingBusinesses} نشاط بحاجة موافقة</strong>
            <span>راجعهم فوراً — كل تأخير بيأثر على التجربة</span>
          </div>
          <ArrowLeftIcon size={16} className={styles.alertArrow} />
        </Link>
      )}

      {/* Stats Grid */}
      <section className={styles.grid}>
        {CARDS.map(({ key, label, value, Icon, tone, href, hint }) => {
          const content = (
            <>
              <div className={styles.cardTop}>
                <span className={styles.icon}>
                  <Icon size={20} />
                </span>
                {hint && <span className={styles.hint}>{hint}</span>}
              </div>
              <span className={styles.value}>{value}</span>
              <span className={styles.label}>{label}</span>
            </>
          )
          const className = `${styles.card} ${styles[tone]}`
          return href ? (
            <Link key={key} href={href} className={className}>
              {content}
            </Link>
          ) : (
            <div key={key} className={className}>
              {content}
            </div>
          )
        })}
      </section>

      {/* Quick Links */}
      <section className={styles.quickLinks}>
        {QUICK_LINKS.map(({ href, label, Icon }) => (
          <Link key={href} href={href} className={styles.quickCard}>
            <span className={styles.quickIcon}>
              <Icon size={20} />
            </span>
            <span className={styles.quickLabel}>{label}</span>
            <ArrowLeftIcon size={14} className={styles.chev} />
          </Link>
        ))}
      </section>

      {/* Recent Activity */}
      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>آخر النشاطات</h2>
          <span className={styles.sectionHint}>آخر 24 ساعة</span>
        </header>

        <div className={styles.activityGrid}>
          <Link href="/admin/businesses" className={styles.activityCard}>
            <span className={styles.activityIcon}>
              <StoreIcon size={20} />
            </span>
            <div className={styles.activityBody}>
              <span className={styles.activityLabel}>أنشطة جديدة</span>
              <span className={styles.activityValue}>{recent.newBusinesses}</span>
            </div>
            <ArrowLeftIcon size={14} className={styles.chev} />
          </Link>

          <Link href="/admin/users" className={styles.activityCard}>
            <span className={styles.activityIcon}>
              <UserIcon size={20} />
            </span>
            <div className={styles.activityBody}>
              <span className={styles.activityLabel}>مستخدمين جداد</span>
              <span className={styles.activityValue}>{recent.newUsers}</span>
            </div>
            <ArrowLeftIcon size={14} className={styles.chev} />
          </Link>

          <Link href="/admin/analytics" className={styles.activityCard}>
            <span className={styles.activityIcon}>
              <FileTextIcon size={20} />
            </span>
            <div className={styles.activityBody}>
              <span className={styles.activityLabel}>طلبات</span>
              <span className={styles.activityValue}>{recent.newOrders}</span>
            </div>
            <ArrowLeftIcon size={14} className={styles.chev} />
          </Link>

          <Link href="/admin/moderation" className={styles.activityCard}>
            <span className={styles.activityIcon}>
              <StarIcon size={20} />
            </span>
            <div className={styles.activityBody}>
              <span className={styles.activityLabel}>تقييمات</span>
              <span className={styles.activityValue}>{recent.newReviews}</span>
            </div>
            <ArrowLeftIcon size={14} className={styles.chev} />
          </Link>
        </div>
      </section>
    </div>
  )
}
