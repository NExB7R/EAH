import {
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
// كل chip بنفسجي — الأيقونة بس ملونة حسب النوع
// ═══════════════════════════════════════════════════════════

export type ChipTone = 'purple' | 'gold'

export type ChipAction = { type: 'filter'; value: string } | { type: 'scroll'; value: string }

export type Chip = {
  key: string
  label: string
  Icon: React.ComponentType<{ size?: number }>
  tone: ChipTone
  iconColor: string
  action: ChipAction
}

export const CHIPS: Chip[] = [
  {
    key: 'restaurant',
    label: 'مطاعم',
    Icon: UtensilsIcon,
    tone: 'purple',
    iconColor: 'var(--gold-light)',
    action: { type: 'filter', value: 'restaurant' },
  },
  {
    key: 'pharmacy',
    label: 'صيدليات',
    Icon: PillIcon,
    tone: 'purple',
    iconColor: 'var(--teal)',
    action: { type: 'filter', value: 'pharmacy' },
  },
  {
    key: 'delivery',
    label: 'توصيل',
    Icon: BikeIcon,
    tone: 'purple',
    iconColor: 'var(--purple-light)',
    action: { type: 'filter', value: 'delivery_office' },
  },
  {
    key: 'open',
    label: 'مفتوح',
    Icon: ClockIcon,
    tone: 'purple',
    iconColor: 'var(--teal)',
    action: { type: 'filter', value: 'open' },
  },
  {
    key: 'whatsapp',
    label: 'واتساب',
    Icon: WhatsAppIcon,
    tone: 'purple',
    iconColor: '#25d366',
    action: { type: 'filter', value: 'online' },
  },
  {
    key: 'offers',
    label: 'العروض',
    Icon: GiftIcon,
    tone: 'purple',
    iconColor: 'var(--gold-light)',
    action: { type: 'scroll', value: 'offers' },
  },
  {
    key: 'nearby',
    label: 'قريب مني',
    Icon: MapPinIcon,
    tone: 'purple',
    iconColor: 'var(--purple-neon)',
    action: { type: 'scroll', value: 'nearby' },
  },
  {
    key: 'recommend',
    label: 'ارشحلك',
    Icon: SparklesIcon,
    tone: 'purple',
    iconColor: 'var(--gold-light)',
    action: { type: 'scroll', value: 'suggested' },
  },
  {
    key: 'trending',
    label: 'الترند',
    Icon: TrendingUpIcon,
    tone: 'purple',
    iconColor: 'var(--orange)',
    action: { type: 'scroll', value: 'trending' },
  },
]

export const EXPLORE_CHIP = {
  key: 'explore',
  label: 'استكشف الكل',
  Icon: ArrowLeftIcon,
  tone: 'gold' as ChipTone,
  iconColor: 'var(--gold-light)',
  href: '/explore',
}
