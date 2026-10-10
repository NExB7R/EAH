import {
  LayoutDashboardIcon,
  UtensilsIcon,
  PillIcon,
  BikeIcon,
  ClockIcon,
  WhatsAppIcon,
  GiftIcon,
  MapPinIcon,
  SparklesIcon,
  TrendingUpIcon,
  ArrowLeftIcon,
} from '@/components/icons'

// ═══════════════════════════════════════════════════════════
// EAH — Chips Config (Single Source of Truth)
// ═══════════════════════════════════════════════════════════

export type ChipTone = 'purple' | 'orange' | 'teal' | 'gold' | 'special'

export type ChipAction = { type: 'filter'; value: string } | { type: 'scroll'; value: string }

export type Chip = {
  key: string
  label: string
  Icon: React.ComponentType<{ size?: number }>
  tone: ChipTone
  action: ChipAction
}

export const CHIPS: Chip[] = [
  {
    key: 'all',
    label: 'الكل',
    Icon: LayoutDashboardIcon,
    tone: 'purple',
    action: { type: 'filter', value: 'all' },
  },
  {
    key: 'restaurant',
    label: 'مطاعم',
    Icon: UtensilsIcon,
    tone: 'orange',
    action: { type: 'filter', value: 'restaurant' },
  },
  {
    key: 'pharmacy',
    label: 'صيدليات',
    Icon: PillIcon,
    tone: 'teal',
    action: { type: 'filter', value: 'pharmacy' },
  },
  {
    key: 'delivery',
    label: 'توصيل',
    Icon: BikeIcon,
    tone: 'purple',
    action: { type: 'filter', value: 'delivery_office' },
  },
  {
    key: 'open',
    label: 'مفتوح',
    Icon: ClockIcon,
    tone: 'teal',
    action: { type: 'filter', value: 'open' },
  },
  {
    key: 'online',
    label: 'أونلاين',
    Icon: WhatsAppIcon,
    tone: 'teal',
    action: { type: 'filter', value: 'online' },
  },
  {
    key: 'offers',
    label: 'العروض',
    Icon: GiftIcon,
    tone: 'gold',
    action: { type: 'scroll', value: 'offers' },
  },
  {
    key: 'nearby',
    label: 'قريب مني',
    Icon: MapPinIcon,
    tone: 'purple',
    action: { type: 'scroll', value: 'nearby' },
  },
  {
    key: 'recommend',
    label: 'ارشحلك',
    Icon: SparklesIcon,
    tone: 'gold',
    action: { type: 'scroll', value: 'suggested' },
  },
  {
    key: 'trending',
    label: 'الترند',
    Icon: TrendingUpIcon,
    tone: 'orange',
    action: { type: 'scroll', value: 'trending' },
  },
]

export const EXPLORE_CHIP = {
  key: 'explore',
  label: 'استكشف الكل',
  Icon: ArrowLeftIcon,
  tone: 'special' as ChipTone,
  href: '/explore',
}
