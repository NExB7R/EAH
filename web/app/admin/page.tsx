import Link from 'next/link'
import {
  StoreIcon,
  CrownGoldIcon,
  FileTextIcon,
  StarIcon,
  UserIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
} from '@/components/icons'
import { getAdminStats, getAdminBadges } from '@/lib/data/admin'
import { getUserSession } from '@/lib/data/user'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

type Card = {
  key: string
  label: string
  value: number
  Icon: React.ComponentType<{ size?: number }>
  tone: 'purple' | 'teal' | 'gold'
  href?: string
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
  const [stats, badges, session] = await Promise.all([
    getAdminStats(),
    getAdminBadges(),
    getUserSession(),
  ])

  // Metrics describe the platform; the separate action queue describes
  // work that needs a decision. Avoid displaying the same pending count twice.
  const cards: Card[] = [
    {
      key: 'total',
      label: 'كل الأنشطة',
      value: stats.totalBusinesses,
      Icon: StoreIcon,
      tone: 'purple',
      href: '/admin/businesses',
    },
    {
      key: 'published',
      label: 'نشاط منشور',
      value: stats.publishedBusinesses,
      Icon: CheckCircleIcon,
      tone: 'teal',
      href: '/admin/businesses?status=published',
    },
    {
      key: 'users',
      label: 'المستخدمون',
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
  ]

  const alerts: Alert[] = [
    {
      key: 'pendingBusinesses',
      count: badges.pendingBusinesses,
      label: 'نشاط بانتظار المراجعة',
      desc: 'راجع البيانات وقرار النشر من قائمة الأنشطة',
      href: '/admin/businesses?status=pending',
      tone: 'orange',
      Icon: StoreIcon,
    },
    {
      key: 'flaggedReviews',
      count: badges.flaggedReviews,
      label: 'تقييم بحاجة مراجعة',
      desc: 'راجع التقييمات المعلّمة قبل اتخاذ القرار',
      href: '/admin/moderation',
      tone: 'gold',
      Icon: StarIcon,
    },
    {
      key: 'openReports',
      count: badges.openReports,
      label: 'بلاغ مفتوح',
      desc: 'تابع بلاغات المستخدمين من قسم المراجعة',
      href: '/admin/moderation?tab=reports',
      tone: 'purple',
      Icon: ShieldCheckIcon,
    },
    {
      key: 'pendingSubscriptions',
      count: badges.pendingSubscriptions,
      label: 'طلب اشتراك بانتظار القرار',
      desc: 'راجع طلبات الاشتراك قبل اعتمادها',
      href: '/admin/subscriptions',
      tone: 'teal',
      Icon: CrownGoldIcon,
    },
  ]

  const activeAlerts = alerts.filter((alert) => alert.count > 0)

  return (
    <div className={styles.wrap}>
      <section className={styles.intro}>
        <div className={styles.introCopy}>
          <span className={styles.kicker}>مركز العمليات · EAH</span>
          <h2 className={styles.introTitle}>أهلاً، {session?.displayName || 'مدير المنصة'}</h2>
          <p className={styles.introText}>
            المؤشرات الأساسية والمهام التي تحتاج قرارك — من غير تكرار روابط التنقل الموجودة في
            القائمة.
          </p>
        </div>
        <Link href="/admin/businesses/new" className={styles.primaryAction}>
          <StoreIcon size={17} />
          <span>إضافة نشاط جديد</span>
          <ArrowLeftIcon size={15} />
        </Link>
      </section>

      <section className={styles.section} aria-labelledby="admin-work-queue">
        <header className={styles.sectionHeader}>
          <h2 id="admin-work-queue" className={styles.sectionTitle}>
            المهام التي تحتاج متابعة
          </h2>
          <span className={styles.sectionHint}>تظهر المهام التي لها عناصر معلّقة فقط</span>
        </header>
        {activeAlerts.length > 0 ? (
          <div className={styles.alertsGrid}>
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
                    {alert.count.toLocaleString('ar-EG')} {alert.label}
                  </strong>
                  <span>{alert.desc}</span>
                </div>
                <ArrowLeftIcon size={16} className={styles.alertArrow} />
              </Link>
            ))}
          </div>
        ) : (
          <div className={styles.allClear} role="status">
            <span className={styles.allClearIcon}>
              <CheckCircleIcon size={19} />
            </span>
            <div>
              <strong>لا توجد مهام مراجعة معلّقة حاليًا</strong>
              <span>يمكنك متابعة المؤشرات الأساسية والنشاط الحي من هذه الصفحة.</span>
            </div>
          </div>
        )}
      </section>

      <section className={styles.section} aria-labelledby="admin-platform-metrics">
        <header className={styles.sectionHeader}>
          <h2 id="admin-platform-metrics" className={styles.sectionTitle}>
            مؤشرات المنصة
          </h2>
          <span className={styles.sectionHint}>إجماليات حالية</span>
        </header>
        <div className={styles.grid}>
          {cards.map(({ key, label, value, Icon, tone, href }) => {
            const content = (
              <>
                <div className={styles.cardTop}>
                  <span className={styles.icon}>
                    <Icon size={20} />
                  </span>
                  <ArrowLeftIcon size={14} className={styles.chev} />
                </div>
                <span className={styles.value}>{value.toLocaleString('ar-EG')}</span>
                <span className={styles.label}>{label}</span>
              </>
            )
            return (
              <Link key={key} href={href ?? '/admin'} className={`${styles.card} ${styles[tone]}`}>
                {content}
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
