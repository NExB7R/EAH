'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  UserIcon,
  CrownGoldIcon,
  StoreIcon,
  FileTextIcon,
  GiftIcon,
  BellIcon,
  LockIcon,
  ShieldCheckIcon,
  ShareIcon,
  SparkleStarIcon,
} from './icons'
import styles from './account-sidebar.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Account Sidebar
// ═══════════════════════════════════════════════════════════

type Props = {
  unreadNotifs?: number
}

const ITEMS = [
  { key: 'overview', href: '/account', label: 'نظرة عامة', Icon: HomeIcon },
  { key: 'edit', href: '/account/edit', label: 'تعديل البيانات', Icon: UserIcon },
  { key: 'favorites', href: '/account/favorites', label: 'المفضلات', Icon: CrownGoldIcon },
  { key: 'following', href: '/account/following', label: 'المتابعات', Icon: StoreIcon },
  { key: 'orders', href: '/account/orders', label: 'الطلبات', Icon: FileTextIcon },
  { key: 'points', href: '/account/points', label: 'النقاط', Icon: GiftIcon },
  { key: 'loyalty', href: '/account/loyalty', label: 'الولاء', Icon: CrownGoldIcon },
  { key: 'badges', href: '/account/badges', label: 'الشارات', Icon: SparkleStarIcon },
  { key: 'referral', href: '/account/referral', label: 'دعوة أصدقاء', Icon: ShareIcon },
  {
    key: 'notifications',
    href: '/account/notifications',
    label: 'الإشعارات',
    Icon: BellIcon,
    badge: 'notifs',
  },
  { key: 'security', href: '/account/security', label: 'الأمان', Icon: LockIcon },
  { key: 'verify', href: '/account/verify', label: 'التوثيق', Icon: ShieldCheckIcon },
]

export default function AccountSidebar({ unreadNotifs = 0 }: Props) {
  const pathname = usePathname()

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav} aria-label="تنقل الحساب">
        {ITEMS.map(({ key, href, label, Icon, badge }) => {
          const active = href === '/account' ? pathname === '/account' : pathname.startsWith(href)

          return (
            <Link
              key={key}
              href={href}
              className={`${styles.item} ${active ? styles.active : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <span className={styles.iconWrap}>
                <Icon size={18} />
              </span>
              <span className={styles.label}>{label}</span>
              {badge === 'notifs' && unreadNotifs > 0 && (
                <span className={styles.badge}>{unreadNotifs > 9 ? '9+' : unreadNotifs}</span>
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
