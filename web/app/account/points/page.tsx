import { redirect } from 'next/navigation'
import { GiftIcon, StarIcon, TrendingUpIcon } from '@/components/icons'
import { getUserSession } from '@/lib/data/user'
import { getPointsLog, getAccountStats } from '@/lib/data/account'
import AccountPageHeader from '@/components/account-page-header'
import EmptyState from '@/components/empty-state'
import styles from './points.module.css'

const REASON_LABEL: Record<string, string> = {
  daily_login: 'تسجيل دخول يومي',
  review: 'تقييم نشاط',
  review_with_photo: 'تقييم بصورة',
  order: 'طلب مكتمل',
  invite_signup: 'دعوة صديق (تسجيل)',
  invite_order: 'دعوة صديق (أول طلب)',
  favorite: 'إضافة للمفضلة',
  follow: 'متابعة نشاط',
  share: 'مشاركة',
  signup: 'تسجيل جديد',
}

function tierOf(points: number): { label: string; color: string } {
  if (points >= 10000) return { label: 'Diamond', color: '#C77DFF' }
  if (points >= 5000) return { label: 'Platinum', color: '#E0B8FF' }
  if (points >= 2000) return { label: 'Gold', color: '#E8C79A' }
  if (points >= 500) return { label: 'Silver', color: '#D4D4D8' }
  return { label: 'Bronze', color: '#D08A4B' }
}

export default async function PointsPage() {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/account/points')

  const [stats, logs] = await Promise.all([
    getAccountStats(session.userId),
    getPointsLog(session.userId, 50),
  ])

  const tier = tierOf(stats.pointsBalance)

  return (
    <div>
      <AccountPageHeader
        title="النقاط والمكافآت"
        description="كل تفاعل بياخدك خطوة أعلى"
      />

      <div className={styles.top}>
        <div className={styles.balanceCard}>
          <span className={styles.balanceIcon}>
            <GiftIcon size={28} />
          </span>
          <span className={styles.balanceValue}>
            {stats.pointsBalance.toLocaleString('ar-EG')}
          </span>
          <span className={styles.balanceLabel}>رصيد النقاط</span>
        </div>

        <div className={styles.tierCard} style={{ borderColor: tier.color }}>
          <span className={styles.tierIcon} style={{ color: tier.color }}>
            <StarIcon size={24} />
          </span>
          <span className={styles.tierValue} style={{ color: tier.color }}>
            {tier.label}
          </span>
          <span className={styles.tierLabel}>مستواك</span>
        </div>
      </div>

      {logs.length === 0 ? (
        <EmptyState
          Icon={TrendingUpIcon}
          title="مفيش سجل نقاط لسه"
          description="ابدأ تسجل دخول، تقيّم أنشطة، وتكسب نقاط"
          ctaHref="/explore"
          ctaLabel="اكتشف أنشطة"
        />
      ) : (
        <ul className={styles.list}>
          {logs.map((log) => {
            const label = REASON_LABEL[log.reason] ?? log.reason
            const date = new Date(log.created_at).toLocaleDateString('ar-EG')
            const positive = log.delta > 0
            return (
              <li key={log.id} className={styles.row}>
                <span className={styles.reason}>{label}</span>
                <span
                  className={`${styles.delta} ${positive ? styles.plus : styles.minus}`}
                >
                  {positive ? '+' : ''}
                  {log.delta}
                </span>
                <span className={styles.balance}>
                  الرصيد: {log.balance_after}
                </span>
                <span className={styles.date}>{date}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
