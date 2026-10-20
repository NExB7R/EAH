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

type Props = {
  unreadNotifs?: number
}

type Item = {
  key: string
  href: string
  label: string
  Icon: React.ComponentType<{ size?: number }>
  badge?: 'notifs'
}

type Section = {
  title: string
  items: Item[]
}

const SECTIONS: Section[] = [
  {
    title: 'حسابي',
    items: [
      { key: 'overview', href: '/account', label: 'نظرة عامة', Icon: HomeIcon },
      { key: 'edit', href: '/account/edit', label: 'بياناتي الشخصية', Icon: UserIcon },
      { key: 'security', href: '/account/security', label: 'الأمان', Icon: LockIcon },
      { key: 'verify', href: '/account/verify', label: 'التوثيق', Icon: ShieldCheckIcon },
    ],
  },
  {
    title: 'استخدام المنصة',
    items: [
      { key: 'orders', href: '/account/orders', label: 'الطلبات', Icon: FileTextIcon },
      { key: 'favorites', href: '/account/favorites', label: 'المفضلات', Icon: CrownGoldIcon },
      { key: 'following', href: '/account/following', label: 'المتابعات', Icon: StoreIcon },
      {
        key: 'notifications',
        href: '/account/notifications',
        label: 'الإشعارات',
        Icon: BellIcon,
        badge: 'notifs',
      },
    ],
  },
  {
    title: 'النقاط والمكافآت',
    items: [
      { key: 'points', href: '/account/points', label: 'النقاط', Icon: GiftIcon },
      { key: 'loyalty', href: '/account/loyalty', label: 'الولاء', Icon: CrownGoldIcon },
      { key: 'badges', href: '/account/badges', label: 'الشارات', Icon: SparkleStarIcon },
      { key: 'referral', href: '/account/referral', label: 'دعوة أصدقاء', Icon: ShareIcon },
    ],
  },
  {
    title: 'الثقة',
    items: [{ key: 'trust', href: '/trust', label: 'المصداقية', Icon: ShieldCheckIcon }],
  },
]

export default function AccountSidebar({ unreadNotifs = 0 }: Props) {
  const pathname = usePathname()

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav} aria-label="إعدادات وحساب المستخدم">
        {SECTIONS.map((section) => (
          <div key={section.title} className={styles.section}>
            <h4 className={styles.sectionTitle}>{section.title}</h4>
            <ul className={styles.list}>
              {section.items.map(({ key, href, label, Icon, badge }) => {
                const active = href === '/account' ? pathname === '/account' : pathname.startsWith(href)

                return (
                  <li key={key}>
                    <Link
                      href={href}
                      className={[styles.item, active && styles.active].filter(Boolean).join(' ')}
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
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
