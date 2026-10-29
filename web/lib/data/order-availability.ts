/**
 * In-platform ordering requires both an enabled setting and a linked platform owner.
 * Ownerless activities can remain public and use their separately configured contact channels.
 */
export function canAcceptInAppOrders(acceptsOrders: unknown, ownerProfileId: unknown): boolean {
  return (
    acceptsOrders === true &&
    typeof ownerProfileId === 'string' &&
    ownerProfileId.trim().length > 0
  )
}
