import Link from 'next/link'
import {
  StoreIcon,
  CrownGoldIcon,
  FileTextIcon,
  StarIcon,
  UserIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  SparklesIcon,
  BellIcon,
  AlertIcon,
} from '@/components/icons'
import { getAdminStats, getAdminRecent, getAdminBadges } from '@/lib/data/admin'
import { getAdminOrderFlowStats } from '@/lib/data/admin-orders'
import { getUserSession } from '@/lib/data/user'
import ActivityFeed from '@/components/admin/activity-feed'
import StatCard from '@/components/dashboard/stat-card'
import Panel from '@/components/dashboard/panel'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

type Alert = {
  key: string
  count: number
  label: string
  href: string
  tone: 'orange' | 'gold' | 'teal' | 'purple'
  Icon: React.ComponentType<{ size?: number }>
}

const QUICK_ACTIONS = [
  { href: '/admin/businesses/new', label: 'إضافة نشاط', desc: 'أضف نشاط يدوي', Icon: StoreIcon },
  {
    href: '/admin/businesses?status=pending',
    label: 'مراجعة الأنشطة',
    desc: 'قرارات معلقة',
    Icon: CheckCircleIcon,
  },
  {
    href: '/admin/notifications',
    label: 'إرسال إشعار',
    desc: 'بث للمستخدمين',
    Icon: BellIcon,
  },
  { href: '/admin/studio', label: 'الاستوديو', desc: 'إدارة الميزات', Icon: SparklesIcon },
  { href: '/admin/health', label: 'صحة النظام', desc: 'مراقبة الأخطاء', Icon: AlertIcon },
]

export default async function AdminDashboard() {
  const [stats, recent, badges, session, orderFlow] = await Promise.all([
    getAdminStats(),
    getAdminRecent(),
    getAdminBadges(),
    getUserSession(),
    getAdminOrderFlowStats(),
  ])

  const allAlerts: Alert[] = [
    {
      key: 'pendingBusinesses',
      count: badges.pendingBusinesses,
      label: 'نشاط بانتظار المراجعة',
      href: '/admin/businesses?status=pending',
      tone: 'orange',
      Icon: StoreIcon,
    },
    {
      key: 'flaggedReviews',
      count: badges.flaggedReviews,
      label: 'تقييم بحاجة مراجعة',
      href: '/admin/moderation',
      tone: 'gold',
      Icon: StarIcon,
    },
    {
      key: 'openReports',
      count: badges.openReports,
      label: 'بلاغ مفتوح',
      href: '/admin/moderation?tab=reports',
      tone: 'purple',
      Icon: ShieldCheckIcon,
    },
    {
      key: 'pendingSubscriptions',
      count: badges.pendingSubscriptions,
      label: 'طلب اشتراك معلق',
      href: '/admin/subscriptions',
      tone: 'teal',
      Icon: CrownGoldIcon,
    },
  ]
  const alerts = allAlerts.filter((a) => a.count > 0)

  const today = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className={styles.wrap}>
      {/* Welcome */}
      <section className={styles.welcome}>
        <div className={styles.welcomeText}>
          <span className={styles.kicker}>مركز العمليات</span>
          <h1 className={styles.welcomeTitle}>أهلاً، {session?.displayName || 'مدير المنصة'}</h1>
          <p className={styles.welcomeSub}>{today}</p>
        </div>
        <Link href="/admin/businesses/new" className={styles.primaryAction}>
          <StoreIcon size={16} />
          <span>إضافة نشاط</span>
          <ArrowLeftIcon size={14} />
        </Link>
      </section>

      {/* Alerts */}
      {alerts.length > 0 && (
        <section>
          <header className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>يحتاج انتباهك</h2>
            <span className={styles.sectionHint}>{alerts.length} مهمة</span>
          </header>
          <div className={styles.alertsGrid}>
            {alerts.map(({ key, count, label, href, tone, Icon }) => (
              <Link key={key} href={href} className={`${styles.alert} ${styles[`alert_${tone}`]}`}>
                <span className={styles.alertIcon}>
                  <Icon size={18} />
                </span>
                <div className={styles.alertBody}>
                  <strong>{count.toLocaleString('en-US')}</strong>
                  <span>{label}</span>
                </div>
                <ArrowLeftIcon size={14} className={styles.alertArrow} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* KPIs */}
      <section>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>مؤشرات المنصة</h2>
          <span className={styles.sectionHint}>إجماليات حالية</span>
        </header>
        <div className={styles.kpiGrid}>
          <StatCard
            icon={StoreIcon}
            label="كل الأنشطة"
            value={stats.totalBusinesses}
            hint={recent.newBusinesses > 0 ? `+${recent.newBusinesses} اليوم` : undefined}
            href="/admin/businesses"
            tone="purple"
          />
          <StatCard
            icon={CheckCircleIcon}
            label="منشور"
            value={stats.publishedBusinesses}
            href="/admin/businesses?status=published"
            tone="teal"
          />
          <StatCard
            icon={UserIcon}
            label="المستخدمون"
            value={stats.totalUsers}
            hint={recent.newUsers > 0 ? `+${recent.newUsers} اليوم` : undefined}
            href="/admin/users"
            tone="purple"
          />
          <StatCard
            icon={FileTextIcon}
            label="الطلبات"
            value={stats.totalOrders}
            hint={recent.newOrders > 0 ? `+${recent.newOrders} اليوم` : undefined}
            href="/admin/analytics"
            tone="gold"
          />
        </div>
      </section>

      {/* Order Flow */}
      <section>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>تدفق الطلبات</h2>
          <Link href="/admin/orders" className={styles.sectionHint}>
            عرض الكل ←
          </Link>
        </header>
        <div className={styles.kpiGrid}>
          <StatCard
            icon={FileTextIcon}
            label="طلبات النهاردة"
            value={orderFlow.today}
            href="/admin/orders"
            tone="purple"
          />
          <StatCard
            icon={AlertIcon}
            label="معلقة"
            value={orderFlow.pending}
            href="/admin/orders"
            tone="orange"
          />
          <StatCard
            icon={ClockIcon}
            label="نشطة"
            value={orderFlow.in_progress}
            href="/admin/orders"
            tone="gold"
          />
          <StatCard
            icon={CheckCircleIcon}
            label="اتسلّمت النهاردة"
            value={orderFlow.delivered_today}
            href="/admin/orders"
            tone="teal"
          />
        </div>
      </section>

      {/* Two column: Activity + Quick Actions */}
      <div className={styles.twoCol}>
        <div className={styles.colMain}>
          <ActivityFeed />
        </div>
        <aside className={styles.colSide}>
          <Panel title="إجراءات سريعة">
            <ul className={styles.quickList}>
              {QUICK_ACTIONS.map(({ href, label, desc, Icon }) => (
                <li key={href}>
                  <Link href={href} className={styles.quickLink}>
                    <span className={styles.quickIcon}>
                      <Icon size={16} />
                    </span>
                    <div className={styles.quickText}>
                      <span className={styles.quickLabel}>{label}</span>
                      <span className={styles.quickDesc}>{desc}</span>
                    </div>
                    <ArrowLeftIcon size={12} className={styles.quickArrow} />
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        </aside>
      </div>
    </div>
  )
}
