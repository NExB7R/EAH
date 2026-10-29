export function hasNonEmptyContact(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0
}

export function isWhatsAppChannelAvailable(
  enabled: unknown,
  businessId: unknown,
  configuredBusinessIds: ReadonlySet<string>,
): boolean {
  return (
    enabled === true &&
    typeof businessId === 'string' &&
    businessId.length > 0 &&
    configuredBusinessIds.has(businessId)
  )
}
