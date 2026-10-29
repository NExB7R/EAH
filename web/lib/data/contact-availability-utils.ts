export function normalizeWhatsAppDestination(value: unknown): string | null {
  if (typeof value !== 'string') return null

  const digits = value.replace(/\\D/g, '')
  if (!digits) return null

  const normalized = digits.startsWith('20')
    ? digits
    : digits.startsWith('0')
      ? `20${digits.slice(1)}`
      : `20${digits}`

  return normalized.length >= 11 && normalized.length <= 15 ? normalized : null
}

export function hasUsableWhatsAppDestination(value: unknown): boolean {
  return normalizeWhatsAppDestination(value) !== null
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
