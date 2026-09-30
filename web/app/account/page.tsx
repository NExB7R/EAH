import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  CrownGoldIcon,
  StoreIcon,
  FileTextIcon,
  GiftIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  StarIcon,
} from '@/components/icons'
import Avatar from '@/components/avatar'
import { getUserSession } from '@/lib/data/user'
import { getAccountStats, getFullProfile } from '@/lib/data/account'
import styles from './page.module.css'

export default async function AccountPage() {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/account')

  const [profile, stats] = await Promise.all([
    getFullProfile(session.userId),
    getAccountStats(session.userId),
  ])

  if (!profile) redirect('/auth?next=/account')

  const memberSince = new Date(profile.created_at).getFullYear()

  const STATS = [
    {
      key: 'points',
      label: 'النقاط',
      value: stats.pointsBalance,
      href: '/account/points',
      Icon: GiftIcon,
      tone: 'gold',
    },
    {
      key: 'favorites',
      label: 'المفضلات',
      value: stats.favoritesCount,
      href: '/account/favorites',
      Icon: CrownGoldIcon,
      tone: 'purple',
    },
    {
      key: 'following',
      label: 'المتابعات',
      value: stats.followsCount,
      href: '/account/following',
      Icon: StoreIcon,
      tone: 'purple',
    },
    {
      key: 'orders',
      label: 'الطلبات',
      value: stats.ordersCount,
      href: '/account/orders',
      Icon: FileTextIcon,
      tone: 'purple',
    },
  ] as const

  return (
    <div className={styles.wrap}>
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden />
        <div className={styles.heroBody}>
          <Avatar
            displayName={profile.display_name}
            avatarUrl={profile.avatar_url}
            role={session.role}
            phoneVerified={!!profile.phone_verified_at}
            size="lg"
          />
          <div className={styles.info}>
            <h1 className={styles.name}>{profile.display_name}</h1>
            <p className={styles.phone}>
              {profile.phone ? `+20 ${profile.phone.replace(/^0/, '')}` : '—'}
            </p>
            <div className={styles.chips}>
              <span className={styles.chip}>
                <StarIcon size={12} />
                {profile.trust_score} ثقة
              </span>
              {profile.phone_verified_at && (
                <span className={`${styles.chip} ${styles.chipOk}`}>
                  <ShieldCheckIcon size={12} />
                  موثّق
                </span>
              )}
              <span className={styles.chip}>عضو من {memberSince}</span>
            </div>
          </div>
          <Link href="/account/edit" className={styles.editBtn}>
            <span>تعديل</span>
            <ArrowLeftIcon size={14} />
          </Link>
        </div>
      </section>

      <section className={styles.stats}>
        {STATS.map(({ key, label, value, href, Icon, tone }) => (
          <Link key={key} href={href} className={`${styles.statCard} ${styles[tone]}`}>
            <span className={styles.statIcon}>
              <Icon size={20} />
            </span>
            <span className={styles.statValue}>{value}</span>
            <span className={styles.statLabel}>{label}</span>
          </Link>
        ))}
      </section>
    </div>
  )
}
