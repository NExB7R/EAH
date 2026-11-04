import type { Business } from '@/lib/data/businesses'

/**
 * The public in-app order flag is independent from direct WhatsApp contact.
 * Keep homepage chips, explore filters and future surfaces on one rule.
 */
export function canReceiveInAppOrders(
  business: Pick<Business, 'accepts_orders'>,
): boolean {
  return business.accepts_orders === true
}

export function filterInAppOrderBusinesses<T extends Pick<Business, 'accepts_orders'>>(
  businesses: T[],
): T[] {
  return businesses.filter(canReceiveInAppOrders)
}
