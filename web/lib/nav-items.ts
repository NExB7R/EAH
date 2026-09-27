import type { ComponentType } from 'react'
import {
  HomeIcon,
  CompassIcon,
  CrownGoldIcon,
  TrendingUpIcon,
  GiftIcon,
  MapPinIcon,
  LampIcon,
  SparkleStarIcon,
} from '@/components/icons'

// ═══════════════════════════════════════════════════════════
// EAH — Section Nav Items
// ⚙️ لما تعمل الصفحة → غيّر enabled لـ true
// ═══════════════════════════════════════════════════════════

type IconComp = ComponentType<{ size?: number; className?: string }>

export type NavItem = {
  key: string
  href: string
  label: string
  hint: string
  Icon: IconComp
  enabled: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'home',     href: '/',         label: 'الرئيسية',         hint: 'ابدأ من هنا',           Icon: HomeIcon,        enabled: true },
  { key: 'discover', href: '/explore',  label: 'الاكتشاف',         hint: 'اكتشف اللي حواليك',     Icon: CompassIcon,     enabled: true },
  { key: 'featured', href: '/featured', label: 'المميزون',         hint: 'الأنشطة المميزة',       Icon: CrownGoldIcon,   enabled: true },
  { key: 'trends',   href: '/trends',   label: 'الترند',           hint: 'الأكثر تفاعلاً',         Icon: TrendingUpIcon,  enabled: true },
  { key: 'offers',   href: '/offers',   label: 'العروض',           hint: 'أحدث العروض',            Icon: GiftIcon,        enabled: true },
  { key: 'nearby',   href: '/nearby',   label: 'قريب مني',         hint: 'الأنشطة القريبة منك',    Icon: MapPinIcon,      enabled: true },
  { key: 'new',      href: '/new',      label: 'الأنشطة الجديدة',  hint: 'اكتشف الجديد',           Icon: LampIcon,        enabled: true },
  { key: 'suggest',  href: '/suggest',  label: 'الترشيح',          hint: 'رشّح نشاط',              Icon: SparkleStarIcon, enabled: true },
]
