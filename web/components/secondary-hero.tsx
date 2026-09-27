import type { ReactNode } from 'react'
import PageHeader from './page-header'
import SectionNav from './section-nav'

// ═══════════════════════════════════════════════════════════
// EAH — Secondary Hero
// PageHeader (لوجو + خط ملون) + SectionNav (تحت بمسافة)
// نفس شكل /explore تماماً
// ═══════════════════════════════════════════════════════════

type Props = {
  activeKey?: string
  title?: string
  count?: number
  children?: ReactNode
}

export default function SecondaryHero({
  activeKey,
  title,
  count,
  children,
}: Props) {
  return (
    <>
      <PageHeader showBack={false} title={title} count={count}>
        {children}
      </PageHeader>
      <SectionNav activeKey={activeKey} />
    </>
  )
}
