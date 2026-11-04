import {
  UtensilsIcon,
  PillIcon,
  BikeIcon,
  ClockIcon,
  CartIcon,
  GiftIcon,
  MapPinIcon,
  SparklesIcon,
  TrendingUpIcon,
  ArrowLeftIcon,
} from '@/components/icons'

// ═══════════════════════════════════════════════════════════
// EAH — Chips Config (Single Source of Truth)
// 3 groups: types / features / discovery
// كل chip بنفسجي — الأيقونات بنفسجية (ترث لون الـ chip)
// ═══════════════════════════════════════════════════════════

export type ChipTone = 'purple' | 'gold'
export type ChipGroup = 'types' | 'features' | 'discovery'

export type ChipAction = { type: 'filter'; value: string } | { type: 'scroll'; value: string }

export type Chip = {
  key: string
  label: string
  Icon: React.ComponentType<{ size?: number }>
  tone: ChipTone
  group: ChipGroup
  iconColor: string
  action: ChipAction
}

export const CHIPS: Chip[] = [
  // ─── الأنواع ───
  {
    key: 'restaurant',
    label: 'مطاعم',
    Icon: UtensilsIcon,
    tone: 'purple',
    group: 'types',
    iconColor: 'rgba(232, 199, 154, 0.75)',
    action: { type: 'filter', value: 'restaurant' },
  },
  {
    key: 'pharmacy',
    label: 'صيدليات',
    Icon: PillIcon,
    tone: 'purple',
    group: 'types',
    iconColor: 'rgba(85, 231, 209, 0.7)',
    action: { type: 'filter', value: 'pharmacy' },
  },
  {
    key: 'delivery',
    label: 'مكاتب التوصيل',
    Icon: BikeIcon,
    tone: 'purple',
    group: 'types',
    iconColor: 'rgba(199, 125, 255, 0.85)',
    action: { type: 'filter', value: 'delivery_office' },
  },
  {
    key: 'misc',
    label: 'أنشطة أخرى',
    Icon: SparklesIcon,
    tone: 'purple',
    group: 'types',
    iconColor: 'rgba(232, 199, 154, 0.75)',
    action: { type: 'filter', value: 'misc' },
  },
  // ─── الاكتشاف ───
  {
    key: 'offers',
    label: 'العروض',
    Icon: GiftIcon,
    tone: 'purple',
    group: 'discovery',
    iconColor: 'rgba(232, 199, 154, 0.75)',
    action: { type: 'scroll', value: 'offers' },
  },
  {
    key: 'trending',
    label: 'الترند',
    Icon: TrendingUpIcon,
    tone: 'purple',
    group: 'discovery',
    iconColor: 'rgba(253, 186, 116, 0.7)',
    action: { type: 'scroll', value: 'trending' },
  },
  {
    key: 'recommend',
    label: 'ارشحلك',
    Icon: SparklesIcon,
    tone: 'purple',
    group: 'discovery',
    iconColor: 'rgba(232, 199, 154, 0.75)',
    action: { type: 'scroll', value: 'suggested' },
  },
  // ─── الخصائص ───
  {
    key: 'open',
    label: 'مفتوح الان',
    Icon: ClockIcon,
    tone: 'purple',
    group: 'features',
    iconColor: 'rgba(85, 231, 209, 0.7)',
    action: { type: 'filter', value: 'open' },
  },
  {
    key: 'online-orders',
    label: 'طلبات أونلاين',
    Icon: CartIcon,
    tone: 'purple',
    group: 'features',
    iconColor: 'rgba(37, 211, 102, 0.7)',
    action: { type: 'filter', value: 'online' },
  },
  {
    key: 'nearby',
    label: 'قريب مني',
    Icon: MapPinIcon,
    tone: 'purple',
    group: 'features',
    iconColor: 'rgba(168, 85, 247, 0.85)',
    action: { type: 'scroll', value: 'nearby' },
  },
]

export const EXPLORE_CHIP = {
  key: 'explore',
  label: 'استكشف الكل',
  Icon: ArrowLeftIcon,
  tone: 'gold' as ChipTone,
  group: 'discovery' as ChipGroup,
  href: '/explore',
}
