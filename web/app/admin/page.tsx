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
import { getAdminStats, getAdminRecent, getAdminBadges } from '@/lib/data/admin'
import ActivityFeed from '@/components/admin/activity-feed'
import ErrorPulse from '@/components/admin/error-pulse'
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

type Alert = {
  key: string
  count: number
  label: string
  desc: string
  href: string
  tone: 'orange' | 'gold' | 'teal' | 'purple'
  Icon: React.ComponentType<{ size?: number }>
}

export default async function AdminDashboard() {
  const [stats, recent, badges] = await Promise.all([
    getAdminStats(),
    getAdminRecent(),
    getAdminBadges(),
  ])

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

  const ALERTS: Alert[] = [
    {
      key: 'pendingBusinesses',
      count: badges.pendingBusinesses,
      label: 'نشاط بحاجة موافقة',
      desc: 'راجعهم بسرعة — كل تأخير بيأثر على التجربة',
      href: '/admin/businesses?status=pending',
      tone: 'orange',
      Icon: StoreIcon,
    },
    {
      key: 'flaggedReviews',
      count: badges.flaggedReviews,
      label: 'تقييم بحاجة مراجعة',
      desc: 'تقييمات معلّمة من النظام — راجعها',
      href: '/admin/moderation',
      tone: 'gold',
      Icon: StarIcon,
    },
    {
      key: 'openReports',
      count: badges.openReports,
      label: 'إبلاغ مفتوح',
      desc: 'بلاغات من المستخدمين بانتظار قرار',
      href: '/admin/reports',
      tone: 'purple',
      Icon: ShieldCheckIcon,
    },
    {
      key: 'pendingSubscriptions',
      count: badges.pendingSubscriptions,
      label: 'اشتراك بحاجة موافقة',
      desc: 'طلبات ترقية من التجار',
      href: '/admin/subscriptions',
      tone: 'teal',
      Icon: CrownGoldIcon,
    },
  ]

  const activeAlerts = ALERTS.filter((a) => a.count > 0)

  return (
    <div className={styles.wrap}>
      {/* ─── Alerts (كل التنبيهات) ─── */}
      {activeAlerts.length > 0 && (
        <section className={styles.alertsGrid}>
          {activeAlerts.map((alert) => (
            <Link
              key={alert.key}
              href={alert.href}
              className={`${styles.alert} ${styles[`alert_${alert.tone}`]}`}
            >
              <span className={styles.alertIcon}>
                <alert.Icon size={22} />
              </span>
              <div className={styles.alertBody}>
                <strong>
                  {alert.count} {alert.label}
                </strong>
                <span>{alert.desc}</span>
              </div>
              <ArrowLeftIcon size={16} className={styles.alertArrow} />
            </Link>
          ))}
        </section>
      )}

      {/* ─── Stats Grid ─── */}
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

      {/* ─── Recent Activity (آخر 24 ساعة) ─── */}
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

      {/* ─── Quick Actions ─── */}
      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>إجراءات سريعة</h2>
        </header>

        <div className={styles.quickLinks}>
          <Link href="/admin/studio" className={styles.quickCard}>
            <span className={styles.quickIcon}>
              <TrendingUpIcon size={20} />
            </span>
            <span className={styles.quickLabel}>الاستوديو (الميزات)</span>
            <ArrowLeftIcon size={14} className={styles.chev} />
          </Link>

          <Link href="/admin/notifications" className={styles.quickCard}>
            <span className={styles.quickIcon}>
              <GiftIcon size={20} />
            </span>
            <span className={styles.quickLabel}>إرسال إشعار</span>
            <ArrowLeftIcon size={14} className={styles.chev} />
          </Link>

          <Link href="/admin/analytics" className={styles.quickCard}>
            <span className={styles.quickIcon}>
              <TrendingUpIcon size={20} />
            </span>
            <span className={styles.quickLabel}>التقارير</span>
            <ArrowLeftIcon size={14} className={styles.chev} />
          </Link>
        </div>
      </section>

      {/* ─── Live Activity Feed ─── */}
      <section className={styles.section}>
        <ActivityFeed />
      </section>

      {/* ─── Critical Error Toast ─── */}
      <ErrorPulse />
    </div>
  )
}
