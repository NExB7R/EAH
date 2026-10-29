export function normalizeWhatsAppDestination(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const input = value.trim()
  if (!input) return null

  const waUrl = input.match(/^https?:\/\/wa\.me\/(\+?\d{8,15})\/?$/i)
  const raw = waUrl?.[1] ?? input
  if (!/^\+?[\d\s().-]+$/.test(raw)) return null

  const startsInternational = raw.startsWith('+')
  const startsInternational00 = raw.startsWith('00')
  let digits = raw.replace(/\D/g, '')
  if (startsInternational00) {
    digits = digits.slice(2)
  } else if (!startsInternational && digits.startsWith('0')) {
    digits = '20' + digits.slice(1)
  } else if (!startsInternational && !digits.startsWith('20') && digits.length < 11) {
    // Do not guess a country code for ambiguous local numbers.
    return null
  }

  return digits.length >= 8 && digits.length <= 15 ? digits : null
}

export function normalizePhoneDestination(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const input = value.trim()
  if (!/^\+?[\d\s().-]{8,25}$/.test(input)) return null
  const normalized = input.replace(/[\s().-]/g, '')
  return /^\+?\d{8,15}$/.test(normalized) ? normalized : null
}

export function hasUsablePhoneDestination(value: unknown): boolean {
  return normalizePhoneDestination(value) !== null
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
