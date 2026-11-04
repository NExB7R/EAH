/**
 * The public in-app order flag is independent from direct WhatsApp contact.
 * Keep homepage chips, explore filters and future surfaces on one rule.
 */
export function canReceiveInAppOrders(
  business: { accepts_orders?: boolean | null },
): boolean {
  return business.accepts_orders === true
}

export function filterInAppOrderBusinesses<T extends { accepts_orders?: boolean | null }>(
  businesses: T[],
): T[] {
  return businesses.filter(canReceiveInAppOrders)
}
