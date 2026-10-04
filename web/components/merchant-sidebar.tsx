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
} from './icons'
import styles from './merchant-sidebar.module.css'

type Props = {
  newOrders?: number
}

const ITEMS = [
  { href: '/merchant', label: 'نظرة عامة', Icon: LayoutDashboardIcon },
  { href: '/merchant/insights', label: 'المساعد الذكي', Icon: SparklesIcon, tone: 'gold' },
  { href: '/merchant/business', label: 'نشاطي', Icon: StoreIcon },
  { href: '/merchant/branches', label: 'الفروع', Icon: MapPinIcon },
  { href: '/merchant/orders', label: 'الطلبات', Icon: FileTextIcon, badge: 'orders' },
  { href: '/merchant/offers', label: 'العروض', Icon: GiftIcon },
  { href: '/merchant/qr', label: 'QR النشاط', Icon: QrCodeIcon },
  { href: '/merchant/subscription', label: 'الاشتراك', Icon: CrownGoldIcon },
  { href: '/merchant/settings', label: 'الإعدادات', Icon: SettingsIcon },
]

export default function MerchantSidebar({ newOrders = 0 }: Props) {
  const pathname = usePathname()

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav} aria-label="تنقل التاجر">
        {ITEMS.map(({ href, label, Icon, badge, tone }) => {
          const active = href === '/merchant' ? pathname === '/merchant' : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              className={`${styles.item} ${active ? styles.active : ''} ${tone === 'gold' ? styles.itemGold : ''}`}
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
          )
        })}
      </nav>
    </aside>
  )
}
