import type { ContactOption } from '@/lib/data/contact-options'

type FixedBusinessCtaInput = {
  isOwner?: boolean
  ordersEnabled: boolean
  contactOptions: readonly Pick<ContactOption, 'method'>[]
}

/**
 * Keep the page's reserved bottom space in sync with FixedCta's render conditions.
 * Direct phone contact remains in the in-page actions, not the sticky bar.
 */
export function shouldRenderFixedBusinessCta({
  isOwner = false,
  ordersEnabled,
  contactOptions,
}: FixedBusinessCtaInput): boolean {
  return (
    isOwner ||
    ordersEnabled ||
    contactOptions.some((option) => option.method === 'whatsapp')
  )
}
