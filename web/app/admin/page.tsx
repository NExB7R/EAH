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
} from '@/components/icons'
import { getAdminStats } from '@/lib/data/admin'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

type Card = {
  key: string
  label: string
  value: number
  Icon: React.ComponentType<{ size?: number }>
  tone: 'purple' | 'orange' | 'teal' | 'gold'
  href?: string
}

export default async function AdminDashboard() {
  const stats = await getAdminStats()

  const CARDS: Card[] = [
    { key: 'total', label: 'كل الأنشطة', value: stats.totalBusinesses, Icon: StoreIcon, tone: 'purple' },
    { key: 'pending', label: 'بحاجة موافقة', value: stats.pendingBusinesses, Icon: AlertIcon, tone: 'orange', href: '/admin/businesses' },
    { key: 'published', label: 'منشور', value: stats.publishedBusinesses, Icon: CheckCircleIcon, tone: 'teal' },
    { key: 'users', label: 'المستخدمين', value: stats.totalUsers, Icon: UserIcon, tone: 'purple' },
    { key: 'orders', label: 'الطلبات', value: stats.totalOrders, Icon: FileTextIcon, tone: 'gold' },
    { key: 'reviews', label: 'التقييمات', value: stats.totalReviews, Icon: StarIcon, tone: 'gold' },
  ]

  return (
    <div className={styles.wrap}>
      {/* Pending alert */}
      {stats.pendingBusinesses > 0 && (
        <Link href="/admin/businesses" className={styles.alert}>
          <span className={styles.alertIcon}>
            <AlertIcon size={22} />
          </span>
          <div className={styles.alertBody}>
            <strong>عندك {stats.pendingBusinesses} نشاط بحاجة موافقة</strong>
            <span>راجعهم من صفحة الأنشطة</span>
          </div>
          <ArrowLeftIcon size={16} className={styles.alertArrow} />
        </Link>
      )}

      <section className={styles.grid}>
        {CARDS.map(({ key, label, value, Icon, tone, href }) => {
          const content = (
            <>
              <span className={styles.icon}>
                <Icon size={22} />
              </span>
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

      {/* Quick links */}
      <section className={styles.quickLinks}>
        <Link href="/admin/businesses" className={styles.quickCard}>
          <span className={styles.quickIcon}>
            <StoreIcon size={22} />
          </span>
          <div className={styles.quickBody}>
            <strong>إدارة الأنشطة</strong>
            <small>موافقة + رفض + تعديل</small>
          </div>
          <ArrowLeftIcon size={16} className={styles.chev} />
        </Link>

        <Link href="/admin/users" className={styles.quickCard}>
          <span className={styles.quickIcon}>
            <UserIcon size={22} />
          </span>
          <div className={styles.quickBody}>
            <strong>إدارة المستخدمين</strong>
            <small>حظر + Trust Score</small>
          </div>
          <ArrowLeftIcon size={16} className={styles.chev} />
        </Link>

        <Link href="/admin/subscriptions" className={styles.quickCard}>
          <span className={styles.quickIcon}>
            <CrownGoldIcon size={22} />
          </span>
          <div className={styles.quickBody}>
            <strong>الاشتراكات</strong>
            <small>موافقة + تمديد + إلغاء</small>
          </div>
          <ArrowLeftIcon size={16} className={styles.chev} />
        </Link>

        <Link href="/admin/analytics" className={styles.quickCard}>
          <span className={styles.quickIcon}>
            <FileTextIcon size={22} />
          </span>
          <div className={styles.quickBody}>
            <strong>التحليلات</strong>
            <small>زوار + أنشطة + دخل</small>
          </div>
          <ArrowLeftIcon size={16} className={styles.chev} />
        </Link>
      </section>
    </div>
  )
}
