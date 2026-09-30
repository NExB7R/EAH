import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  StoreIcon,
  CrownGoldIcon,
  FileTextIcon,
  StarIcon,
  EyeIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  AlertIcon,
  GiftIcon,
} from '@/components/icons'
import { getUserSession } from '@/lib/data/user'
import { getMyBusiness, getMerchantStats, getMySubscription } from '@/lib/data/merchant'
import styles from './merchant-page.module.css'

export default async function MerchantDashboard() {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/merchant')

  const business = await getMyBusiness(session.userId)

  // لو مش عنده نشاط
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

  const [stats, subscription] = await Promise.all([
    getMerchantStats(business.id),
    getMySubscription(business.id),
  ])

  const statusBadge = business.is_published
    ? { label: 'منشور', tone: 'ok', Icon: CheckCircleIcon }
    : { label: 'تحت المراجعة', tone: 'pending', Icon: AlertIcon }

  const StatusIcon = statusBadge.Icon

  const STATS = [
    {
      key: 'viewsToday',
      label: 'مشاهدات النهاردة',
      value: stats.viewsToday,
      Icon: EyeIcon,
      tone: 'purple',
    },
    {
      key: 'viewsWeek',
      label: 'مشاهدات الأسبوع',
      value: stats.viewsWeek,
      Icon: EyeIcon,
      tone: 'purple',
    },
    {
      key: 'ordersToday',
      label: 'طلبات النهاردة',
      value: stats.ordersToday,
      Icon: FileTextIcon,
      tone: 'gold',
    },
    {
      key: 'ordersWeek',
      label: 'طلبات الأسبوع',
      value: stats.ordersWeek,
      Icon: FileTextIcon,
      tone: 'gold',
    },
  ] as const

  const trial = subscription?.is_trial
  const expiresAt = subscription ? new Date(subscription.expires_at) : null
  // eslint-disable-next-line react-hooks/purity -- server component, runs per request
  const nowMs = Date.now()
  const daysLeft = expiresAt
    ? Math.max(0, Math.ceil((expiresAt.getTime() - nowMs) / (24 * 60 * 60 * 1000)))
    : 0

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

          <Link href={`/businesses/${business.slug}`} className={styles.viewBtn}>
            <span>شوف صفحتي</span>
            <ArrowLeftIcon size={14} />
          </Link>
        </div>
      </section>

      {/* Trial warning */}
      {trial && daysLeft <= 15 && daysLeft > 0 && (
        <section className={styles.trialWarn}>
          <span className={styles.trialIcon}>
            <GiftIcon size={22} />
          </span>
          <div className={styles.trialBody}>
            <strong>التجربة المجانية بتخلص بعد {daysLeft} يوم</strong>
            <span>عايز تكمّل؟ ادعمنا ببوست — أو اشترك في باقة مدفوعة</span>
          </div>
          <Link href="/merchant/subscription" className={styles.trialBtn}>
            اعرف أكتر
          </Link>
        </section>
      )}

      {/* Stats */}
      <section className={styles.stats}>
        {STATS.map(({ key, label, value, Icon, tone }) => (
          <div key={key} className={`${styles.statCard} ${styles[tone]}`}>
            <span className={styles.statIcon}>
              <Icon size={18} />
            </span>
            <span className={styles.statValue}>{value}</span>
            <span className={styles.statLabel}>{label}</span>
          </div>
        ))}
      </section>

      {/* Quick links */}
      <section className={styles.quickLinks}>
        <Link href="/merchant/business" className={styles.quickCard}>
          <span className={styles.quickIcon}>
            <StoreIcon size={22} />
          </span>
          <span className={styles.quickText}>
            <strong>نشاطي</strong>
            <small>عدّل البيانات والصور والمنيو</small>
          </span>
          <ArrowLeftIcon size={14} className={styles.quickArrow} />
        </Link>

        <Link href="/merchant/orders" className={styles.quickCard}>
          <span className={styles.quickIcon}>
            <FileTextIcon size={22} />
          </span>
          <span className={styles.quickText}>
            <strong>الطلبات</strong>
            <small>شوف الطلبات الواردة</small>
          </span>
          <ArrowLeftIcon size={14} className={styles.quickArrow} />
        </Link>

        <Link href="/merchant/offers" className={styles.quickCard}>
          <span className={styles.quickIcon}>
            <GiftIcon size={22} />
          </span>
          <span className={styles.quickText}>
            <strong>العروض</strong>
            <small>اعمل عروض لجذب العملاء</small>
          </span>
          <ArrowLeftIcon size={14} className={styles.quickArrow} />
        </Link>

        <Link href="/merchant/subscription" className={styles.quickCard}>
          <span className={styles.quickIcon}>
            <CrownGoldIcon size={22} />
          </span>
          <span className={styles.quickText}>
            <strong>الاشتراك</strong>
            <small>شوف باقتك وترقّى</small>
          </span>
          <ArrowLeftIcon size={14} className={styles.quickArrow} />
        </Link>
      </section>
    </div>
  )
}
