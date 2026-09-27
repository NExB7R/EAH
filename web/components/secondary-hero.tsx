import type { ComponentType, ReactNode } from 'react'
import PageHeader from './page-header'
import SectionNav from './section-nav'
import SectionTitle from './section-title'
import type { SectionTone } from './section-title'

// ═══════════════════════════════════════════════════════════
// EAH — Secondary Hero
// PageHeader (لوجو + خط) + SectionNav (اختياري) + SectionTitle
// ═══════════════════════════════════════════════════════════

type IconComp = ComponentType<{ size?: number; className?: string }>

type Props = {
  activeKey?: string
  title?: string
  count?: number
  countLabel?: string
  Icon?: IconComp
  tone?: SectionTone
  showNav?: boolean
  children?: ReactNode
}

export default function SecondaryHero({
  activeKey,
  title,
  count,
  Icon,
  tone = 'gold',
  countLabel,
  showNav = true,
  children,
}: Props) {
  return (
    <>
      <PageHeader showBack={false} logoSize="md">
        {children}
      </PageHeader>

      {showNav && <SectionNav activeKey={activeKey} />}

      {title && Icon && (
        <SectionTitle label={title} Icon={Icon} tone={tone} count={count} countLabel={countLabel} />
      )}
    </>
  )
}
