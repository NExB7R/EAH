import type { ComponentType } from 'react'
import {
  HomeIcon,
  CrownGoldIcon,
  TrendingUpIcon,
  GiftIcon,
  MapPinIcon,
  SparklesIcon,
  SparkleStarIcon,
} from '@/components/icons'

// ═══════════════════════════════════════════════════════════
// EAH — Secondary Nav Items
// عناصر التنقل في الهيرو الثاني
// ⚙️ لما تعمل الصفحة الجديدة → غيّر enabled لـ true
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
  { key: 'home',     href: '/',         label: 'الرئيسية', hint: 'ابدأ من هنا',         Icon: HomeIcon,        enabled: true },
  { key: 'featured', href: '/featured', label: 'المميزون', hint: 'الأنشطة المميزة',     Icon: CrownGoldIcon,   enabled: true },
  { key: 'trends',   href: '/trends',   label: 'الترند',   hint: 'الأكثر تفاعلاً',      Icon: TrendingUpIcon,  enabled: false },
  { key: 'offers',   href: '/offers',   label: 'العروض',   hint: 'أحدث العروض',         Icon: GiftIcon,        enabled: false },
  { key: 'nearby',   href: '/nearby',   label: 'القريب',   hint: 'قريب منك',            Icon: MapPinIcon,      enabled: false },
  { key: 'support',  href: '/support',  label: 'الدعم',    hint: 'ادعم مشروع جديد',     Icon: SparklesIcon,    enabled: false },
  { key: 'suggest',  href: '/suggest',  label: 'الترشيح',  hint: 'رشّح نشاط',           Icon: SparkleStarIcon, enabled: false },
]
