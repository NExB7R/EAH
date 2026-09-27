import type { ComponentType, ReactNode } from 'react'
import PageHeader from './page-header'
import SectionNav from './section-nav'
import SectionTitle from './section-title'
import type { SectionTone } from './section-title'

// ═══════════════════════════════════════════════════════════
// EAH — Secondary Hero
// PageHeader (لوجو + خط) + SectionNav + SectionTitle
// ═══════════════════════════════════════════════════════════

type IconComp = ComponentType<{ size?: number; className?: string }>

type Props = {
  activeKey?: string
  title?: string
  count?: number
  Icon?: IconComp
  tone?: SectionTone
  children?: ReactNode
}

export default function SecondaryHero({
  activeKey,
  title,
  count,
  Icon,
  tone = 'gold',
  children,
}: Props) {
  return (
    <>
      <PageHeader showBack={false} logoSize="md">
        {children}
      </PageHeader>

      <SectionNav activeKey={activeKey} />

      {title && Icon && (
        <SectionTitle label={title} Icon={Icon} tone={tone} count={count} />
      )}
    </>
  )
}
