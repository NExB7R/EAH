'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboardIcon,
  StoreIcon,
  FileTextIcon,
  GiftIcon,
  CrownGoldIcon,
  SettingsIcon,
  SparklesIcon,
  QrCodeIcon,
  MapPinIcon,
  TagIcon,
  ShieldCheckIcon,
  BellIcon,
} from './icons'
import Logo from './logo'
import styles from './merchant-sidebar.module.css'

type Props = {
  newOrders?: number
  hasBusiness?: boolean
}

type Item = {
  href: string
  label: string
  Icon: React.ComponentType<{ size?: number }>
  badge?: 'orders'
  tone?: 'gold'
}

type Section = {
  title: string
  items: Item[]
}

const SECTIONS: Section[] = [
  {
    title: 'الرئيسية',
    items: [{ href: '/merchant', label: 'نظرة عامة', Icon: LayoutDashboardIcon }],
  },
  {
    title: 'إدارة النشاط',
    items: [
      { href: '/merchant/business', label: 'بيانات النشاط', Icon: StoreIcon },
      { href: '/merchant/branches', label: 'الفروع', Icon: MapPinIcon },
    ],
  },
  {
    title: 'الطلبات والتسويق',
    items: [
      { href: '/merchant/orders', label: 'الطلبات', Icon: FileTextIcon, badge: 'orders' },
      { href: '/merchant/offers', label: 'العروض', Icon: GiftIcon },
      { href: '/merchant/ads', label: 'الإعلانات', Icon: TagIcon },
      { href: '/merchant/qr', label: 'رمز الاستجابة السريعة للنشاط', Icon: QrCodeIcon },
    ],
  },
  {
    title: 'النمو والسمعة',
    items: [
      { href: '/merchant/insights', label: 'المساعد الذكي', Icon: SparklesIcon, tone: 'gold' },
      { href: '/merchant/trust', label: 'سمعة النشاط', Icon: ShieldCheckIcon },
      { href: '/merchant/subscription', label: 'الباقة والاشتراك', Icon: CrownGoldIcon },
    ],
  },
  {
    title: 'الإعدادات',
    items: [
      { href: '/merchant/settings', label: 'إعدادات النشاط', Icon: SettingsIcon },
      { href: '/account/notifications', label: 'الإشعارات', Icon: BellIcon },
    ],
  },
]

export default function MerchantSidebar({ newOrders = 0, hasBusiness = true }: Props) {
  const pathname = usePathname()

  const sections: Section[] = hasBusiness
    ? SECTIONS
    : [
        {
          title: 'البداية',
          items: [
            { href: '/merchant', label: 'نظرة عامة', Icon: LayoutDashboardIcon },
            { href: '/merchant/apply', label: 'تسجيل نشاط', Icon: StoreIcon },
          ],
        },
      ]

  return (
    <aside className={styles.sidebar} aria-label="لوحة التاجر">
      <Link href="/merchant" className={styles.brand} aria-label="EAH — لوحة التاجر">
        <Logo size="xs" variant="compact" href={null} />
        <span className={styles.brandText}>لوحة التاجر</span>
      </Link>
      <nav className={styles.nav} aria-label="إدارة نشاطك">
        {sections.map((section) => (
          <div key={section.title} className={styles.section}>
            <h4 className={styles.sectionTitle}>{section.title}</h4>
            <ul className={styles.list}>
              {section.items.map(({ href, label, Icon, badge, tone }) => {
                const active =
                  href === '/merchant' ? pathname === '/merchant' : pathname.startsWith(href)

                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={[
                        styles.item,
                        active && styles.active,
                        tone === 'gold' && styles.itemGold,
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      aria-current={active ? 'page' : undefined}
                    >
                      <span className={styles.iconWrap}>
                        <Icon size={18} />
                      </span>
                      <span className={styles.label}>{label}</span>
                      {badge === 'orders' && newOrders > 0 && (
                        <span className={styles.badge}>{newOrders > 9 ? '9+' : newOrders}</span>
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
