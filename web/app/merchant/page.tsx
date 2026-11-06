import Link from 'next/link'
import { DashboardHeader, BentoGrid, BentoCard } from '@/components/dashboard/bento';
import { redirect } from 'next/navigation'
import {
  StoreIcon,
  CrownGoldIcon,
  FileTextIcon,
  StarIcon,
  ClockIcon,
  EyeIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  AlertIcon,
  GiftIcon,
  TagIcon,
  SettingsIcon,
  ShareIcon,
  SparklesIcon,
} from '@/components/icons'
import { getUserSession } from '@/lib/data/user'
import {
  getMyBusiness,
  getMerchantStats,
  getMySubscription,
  getMerchantOrderFlow,
} from '@/lib/data/merchant'
import StatCard from '@/components/dashboard/stat-card'
import styles from './merchant-page.module.css'

type Alert = {
  key: string
  title: string
  description: string
  href: string
  Icon: React.ComponentType<{ size?: number }>
  tone: 'orange' | 'gold' | 'purple' | 'teal'
}

const QUICK_ACTIONS = [
  { href: '/merchant/orders', label: 'الطلبات', desc: 'إدارة الطلبات', Icon: FileTextIcon },
  {
    href: '/merchant/orders/settings',
    label: 'إعدادات الطلبات',
    desc: 'استلام + ETA',
    Icon: ClockIcon,
  },
  { href: '/merchant/offers', label: 'العروض', desc: 'خصوماتك', Icon: TagIcon },
  { href: '/merchant/qr', label: 'رمز الاستجابة السريعة', desc: 'كود نشاطك', Icon: ShareIcon },
  { href: '/merchant/insights', label: 'التحليلات', desc: 'تقارير ذكية', Icon: SparklesIcon },
  { href: '/merchant/settings', label: 'الإعدادات', desc: 'تخصيص النشاط', Icon: SettingsIcon },
  { href: '/merchant/subscription', label: 'الاشتراك', desc: 'الباقة', Icon: CrownGoldIcon },
]

export default async function MerchantDashboard() {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/merchant')

  const business = await getMyBusiness(session.userId)

  if (!business) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>
          <StoreIcon size={48} />
        </span>
        <h1 className={styles.emptyTitle}>لسه مسجلتش نشاط</h1>
        <p className={styles.emptyText}>سجّل نشاطك مجاناً — تطبيقك الخاص على EAH</p>
        <Link href="/merchant/apply" className={styles.emptyCta}>
          <StoreIcon size={18} />
          <span>سجّل نشاطك دلوقتي</span>
        </Link>
      </div>
    )
  }

  const [stats, subscription, orderFlow] = await Promise.all([
    getMerchantStats(business.id),
    getMySubscription(business.id),
    getMerchantOrderFlow(business.id),
  ])

  const statusBadge = business.is_published
    ? { label: 'منشور', tone: 'ok', Icon: CheckCircleIcon }
    : { label: 'تحت المراجعة', tone: 'pending', Icon: AlertIcon }
  const StatusIcon = statusBadge.Icon

  const trial = subscription?.is_trial
  const expiresAt = subscription ? new Date(subscription.expires_at) : null
  // eslint-disable-next-line react-hooks/purity -- server component, runs per request
  const nowMs = Date.now()
  const daysLeft = expiresAt
    ? Math.max(0, Math.ceil((expiresAt.getTime() - nowMs) / (24 * 60 * 60 * 1000)))
    : 0

  // ═══════════════════════════════════════════════════════════════
  // Alerts — only show what actually needs attention
  // ═══════════════════════════════════════════════════════════════
  const alerts: Alert[] = []

  if (!business.is_published) {
    alerts.push({
      key: 'pending',
      title: 'نشاطك تحت المراجعة',
      description: 'هنراجعه خلال 24 ساعة. اكمل بياناتك عشان يعدي بسرعة.',
      href: '/merchant/business',
      Icon: AlertIcon,
      tone: 'orange',
    })
  }

  if (trial && daysLeft > 0 && daysLeft <= 15) {
    alerts.push({
      key: 'trial',
      title: `التجربة تنتهي بعد ${daysLeft} يوم`,
      description: 'رقّي لباقة مدفوعة عشان متفقدش الوصول.',
      href: '/merchant/subscription',
      Icon: GiftIcon,
      tone: 'gold',
    })
  } else if (subscription && daysLeft === 0) {
    alerts.push({
      key: 'expired',
      title: 'الاشتراك انتهى',
      description: 'جدد اشتراكك عشان تستمر في استقبال الطلبات.',
      href: '/merchant/subscription',
      Icon: CrownGoldIcon,
      tone: 'orange',
    })
  }

  return (
    <div className={styles.wrap}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden />
        <div className={styles.heroBody}>
          <span className={styles.heroIcon}>
            <StoreIcon size={28} />
          </span>
          <div className={styles.info}>
            <h1 className={styles.name}>{business.name}</h1>
            <div className={styles.chips}>
              <span className={`${styles.chip} ${styles[statusBadge.tone]}`}>
                <StatusIcon size={12} />
                {statusBadge.label}
              </span>
              {subscription?.plan && (
                <span className={`${styles.chip} ${styles.gold}`}>
                  <CrownGoldIcon size={12} />
                  {subscription.plan.name_ar}
                </span>
              )}
              {business.rating_count > 0 && (
                <span className={styles.chip}>
                  <StarIcon size={12} />
                  {business.rating_avg.toFixed(1)} ({business.rating_count})
                </span>
              )}
            </div>
          </div>
          {business.is_published ? (
            <Link href={`/businesses/${business.slug}`} className={styles.viewBtn}>
              <span>شوف صفحتي</span>
              <ArrowLeftIcon size={14} />
            </Link>
          ) : (
            <span className={styles.viewBtn} aria-label="الصفحة العامة غير متاحة حتى النشر">
              <AlertIcon size={14} />
              <span>قيد المراجعة</span>
            </span>
          )}
        </div>
      </section>

      {/* Alerts */}
      {alerts.length > 0 && (
        <section>
          <header className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>يحتاج انتباهك</h2>
            <span className={styles.sectionHint}>{alerts.length} مهمة</span>
          </header>
          <div className={styles.alertsGrid}>
            {alerts.map(({ key, title, description, href, Icon, tone }) => (
              <Link key={key} href={href} className={`${styles.alert} ${styles[`alert_${tone}`]}`}>
                <span className={styles.alertIcon}>
                  <Icon size={16} />
                </span>
                <div className={styles.alertBody}>
                  <strong>{title}</strong>
                  <span>{description}</span>
                </div>
                <ArrowLeftIcon size={13} className={styles.alertArrow} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* KPIs */}
      <section>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>أداء نشاطك</h2>
          <span className={styles.sectionHint}>آخر 7 أيام</span>
        </header>
        <div className={styles.kpiGrid}>
          <StatCard
            icon={EyeIcon}
            label="مشاهدات النهاردة"
            value={stats.viewsToday}
            tone="purple"
          />
          <StatCard icon={EyeIcon} label="مشاهدات الأسبوع" value={stats.viewsWeek} tone="purple" />
          <StatCard
            icon={FileTextIcon}
            label="طلبات النهاردة"
            value={stats.ordersToday}
            tone="gold"
          />
          <StatCard
            icon={FileTextIcon}
            label="طلبات الأسبوع"
            value={stats.ordersWeek}
            tone="gold"
          />
        </div>
      </section>

      {/* Order Flow */}
      <section>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>تدفق الطلبات</h2>
          <Link href="/merchant/orders" className={styles.sectionHint}>
            عرض الكل ←
          </Link>
        </header>
        <div className={styles.kpiGrid}>
          <StatCard
            icon={FileTextIcon}
            label="طلبات النهاردة"
            value={stats.ordersToday}
            href="/merchant/orders"
            tone="purple"
          />
          <StatCard
            icon={AlertIcon}
            label="معلقة الآن"
            value={orderFlow.pending}
            href="/merchant/orders"
            tone="orange"
          />
          <StatCard
            icon={ClockIcon}
            label="نشطة الآن"
            value={orderFlow.in_progress}
            href="/merchant/orders"
            tone="gold"
          />
          <StatCard
            icon={StarIcon}
            label="متوسط التقييم"
            value={orderFlow.avg_rating ?? '—'}
            hint={orderFlow.rated_count > 0 ? `${orderFlow.rated_count} تقييم` : undefined}
            tone="teal"
          />
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>إجراءات سريعة</h2>
        </header>
        <div className={styles.quickGrid}>
          {QUICK_ACTIONS.map(({ href, label, desc, Icon }) => (
            <Link key={href} href={href} className={styles.quickCard}>
              <span className={styles.quickIcon}>
                <Icon size={20} />
              </span>
              <div className={styles.quickBody}>
                <span className={styles.quickLabel}>{label}</span>
                <span className={styles.quickDesc}>{desc}</span>
              </div>
              <ArrowLeftIcon size={13} className={styles.quickArrow} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
