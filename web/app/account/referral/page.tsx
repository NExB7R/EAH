import { redirect } from 'next/navigation'
import { GiftIcon, SparklesIcon } from '@/components/icons'
import { getUserSession } from '@/lib/data/user'
import { getFullProfile, getAccountStats } from '@/lib/data/account'
import { getReferralStats, getReferralList } from '@/lib/data/referrals'
import AccountPageHeader from '@/components/account-page-header'
import ReferralShare from './referral-share'
import styles from './referral.module.css'

export const dynamic = 'force-dynamic'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://eah-sq.vercel.app'

const REWARDS = [
  { label: 'صديق يسجّل', points: 30, Icon: SparklesIcon },
  { label: 'صديق يعمل أول طلب', points: 100, Icon: GiftIcon },
]

export default async function ReferralPage() {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/account/referral')

  const [profile, stats, refStats, refList] = await Promise.all([
    getFullProfile(session.userId),
    getAccountStats(session.userId),
    getReferralStats(session.userId),
    getReferralList(session.userId),
  ])

  const code = profile?.referral_code ?? '—'
  const url = `${SITE_URL}/auth?ref=${code}`

  return (
    <div>
      <AccountPageHeader
        title="دعوة أصدقاء"
        description={`${stats.pointsBalance} نقطة — كل دعوة بتزود رصيدك`}
      />

      <section className={styles.codeCard}>
        <div className={styles.codeGlow} aria-hidden />
        <span className={styles.codeLabel}>كود الدعوة</span>
        <div className={styles.codeBox}>
          <code className={styles.code}>{code}</code>
        </div>
        <ReferralShare code={code} url={url} />
      </section>

      <section className={styles.rewards}>
        <h3 className={styles.sectionTitle}>مكافآت الدعوة</h3>
        <div className={styles.rewardsGrid}>
          {REWARDS.map((r) => (
            <div key={r.label} className={styles.rewardCard}>
              <span className={styles.rewardIcon}>
                <r.Icon size={22} />
              </span>
              <div>
                <h4 className={styles.rewardTitle}>{r.label}</h4>
                <p className={styles.rewardPoints}>
                  <strong>+{r.points}</strong> نقطة
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {refStats.total_invited > 0 && (
        <section className={styles.statsSection}>
          <h3 className={styles.sectionTitle}>إحصائياتك</h3>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{refStats.total_invited}</span>
              <span className={styles.statLabel}>دعوة</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{refStats.signed_up}</span>
              <span className={styles.statLabel}>سجّلوا</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{refStats.first_order}</span>
              <span className={styles.statLabel}>طلبوا</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{refStats.total_points}</span>
              <span className={styles.statLabel}>نقطة</span>
            </div>
          </div>
        </section>
      )}

      {refList.length > 0 && (
        <section className={styles.listSection}>
          <h3 className={styles.sectionTitle}>آخر الدعوات</h3>
          <ul className={styles.friends}>
            {refList.slice(0, 10).map((r) => (
              <li key={r.id} className={styles.friend}>
                <div className={styles.friendAvatar}>
                  {r.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.avatar_url} alt={r.display_name} />
                  ) : (
                    <span>{r.display_name.charAt(0)}</span>
                  )}
                </div>
                <div className={styles.friendBody}>
                  <span className={styles.friendName}>{r.display_name}</span>
                  <span className={styles.friendMeta}>
                    {r.first_order_at
                      ? '✓ أول طلب'
                      : new Date(r.signup_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                  </span>
                </div>
                <span className={styles.friendPoints}>+{r.points_awarded}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={styles.how}>
        <h3 className={styles.sectionTitle}>إزاي بتشتغل؟</h3>
        <ol className={styles.steps}>
          <li>
            <span className={styles.stepNum}>1</span>
            <p>شارك الكود مع أصدقائك</p>
          </li>
          <li>
            <span className={styles.stepNum}>2</span>
            <p>صاحبك يسجّل ويدخل الكود</p>
          </li>
          <li>
            <span className={styles.stepNum}>3</span>
            <p>النقاط توصلك فوراً</p>
          </li>
        </ol>
      </section>
    </div>
  )
}
