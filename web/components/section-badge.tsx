import type { ComponentType } from 'react'
import {
  CrownGoldIcon,
  TrendingUpIcon,
  GiftIcon,
  MapPinIcon,
  SparklesIcon,
  TargetIcon,
} from './icons'
import styles from './section-badge.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Section Badge
// شارة موحّدة لكل قسم — لون + أيقونة مميزة
// المستخدم يعرف القسم من الشارة من غير ما يقرأ التفاصيل
// ═══════════════════════════════════════════════════════════

export type BadgeVariant =
  | 'featured'
  | 'trending'
  | 'offers'
  | 'nearby'
  | 'new'
  | 'opportunity'

export type BadgeSize = 'sm' | 'md'

type Props = {
  variant: BadgeVariant
  size?: BadgeSize
  label?: string
}

type IconComp = ComponentType<{ size?: number; className?: string }>

type Meta = { label: string; Icon: IconComp }

const META: Record<BadgeVariant, Meta> = {
  featured: { label: 'مميز', Icon: CrownGoldIcon },
  trending: { label: 'ترند', Icon: TrendingUpIcon },
  offers: { label: 'عروض', Icon: GiftIcon },
  nearby: { label: 'قريب', Icon: MapPinIcon },
  new: { label: 'جديد', Icon: SparklesIcon },
  opportunity: { label: 'فرصة', Icon: TargetIcon },
}

export default function SectionBadge({
  variant,
  size = 'sm',
  label,
}: Props) {
  const meta = META[variant]
  const Icon = meta.Icon
  const text = label ?? meta.label

  return (
    <span className={`${styles.badge} ${styles[variant]} ${styles[size]}`}>
      <Icon size={size === 'sm' ? 12 : 14} />
      <span>{text}</span>
    </span>
  )
}
