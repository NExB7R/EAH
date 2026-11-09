import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import EmptyState from './empty-state'

function MockIcon({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} data-testid="mock-icon" />
}

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState Icon={MockIcon} title="مفيش بيانات" />)
    expect(screen.getByText('مفيش بيانات')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(
      <EmptyState
        Icon={MockIcon}
        title="مفيش بيانات"
        description="وصف توضيحي"
      />,
    )
    expect(screen.getByText('وصف توضيحي')).toBeInTheDocument()
  })

  it('does NOT render description when not provided', () => {
    render(<EmptyState Icon={MockIcon} title="مفيش بيانات" />)
    expect(screen.queryByText('وصف توضيحي')).not.toBeInTheDocument()
  })

  it('renders CTA link when ctaHref + ctaLabel', () => {
    render(
      <EmptyState
        Icon={MockIcon}
        title="مفيش بيانات"
        ctaHref="/explore"
        ctaLabel="اكتشف"
      />,
    )
    const link = screen.getByRole('link', { name: /اكتشف/ })
    expect(link).toHaveAttribute('href', '/explore')
  })

  it('does NOT render CTA without ctaHref', () => {
    render(<EmptyState Icon={MockIcon} title="مفيش بيانات" ctaLabel="اكتشف" />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('renders secondary CTA when both provided', () => {
    render(
      <EmptyState
        Icon={MockIcon}
        title="مفيش بيانات"
        ctaHref="/primary"
        ctaLabel="أساسي"
        secondaryCtaHref="/secondary"
        secondaryCtaLabel="ثانوي"
      />,
    )
    expect(screen.getByRole('link', { name: /أساسي/ })).toHaveAttribute('href', '/primary')
    expect(screen.getByRole('link', { name: /ثانوي/ })).toHaveAttribute('href', '/secondary')
  })

  it('applies default variant class by default', () => {
    const { container } = render(<EmptyState Icon={MockIcon} title="مفيش" />)
    expect(container.firstChild).toHaveClass(/wrap-default/)
  })

  it('applies warning variant class', () => {
    const { container } = render(<EmptyState Icon={MockIcon} title="مفيش" variant="warning" />)
    expect(container.firstChild).toHaveClass(/wrap-warning/)
  })

  it('applies success variant class', () => {
    const { container } = render(<EmptyState Icon={MockIcon} title="مفيش" variant="success" />)
    expect(container.firstChild).toHaveClass(/wrap-success/)
  })

  it('applies info variant class', () => {
    const { container } = render(<EmptyState Icon={MockIcon} title="مفيش" variant="info" />)
    expect(container.firstChild).toHaveClass(/wrap-info/)
  })
})
