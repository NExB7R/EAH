export type InAppOrderSettings = {
  orders_enabled: unknown
  deadline_minutes: unknown
  delivery_eta_minutes: unknown
  offline_mode: unknown
  offline_until: string | null
  suspended_until: string | null
}

/**
 * The shared product rule for showing in-platform orders as currently available.
 * The UI must fail closed when settings are missing, stale, or malformed.
 */
export function isInAppOrderOperational(
  acceptsOrders: unknown,
  ownerProfileId: unknown,
  settings: InAppOrderSettings | null,
  hasUsableWhatsAppDestination: boolean,
  nowMs = Date.now(),
): boolean {
  if (
    acceptsOrders !== true ||
    typeof ownerProfileId !== 'string' ||
    ownerProfileId.trim().length === 0
  ) {
    return false
  }

  if (!settings || settings.orders_enabled !== true || !hasUsableWhatsAppDestination) {
    return false
  }

  if (
    typeof settings.deadline_minutes !== 'number' ||
    !Number.isFinite(settings.deadline_minutes) ||
    settings.deadline_minutes <= 0 ||
    typeof settings.delivery_eta_minutes !== 'number' ||
    !Number.isFinite(settings.delivery_eta_minutes) ||
    settings.delivery_eta_minutes <= 0
  ) {
    return false
  }

  if (settings.offline_mode === true) {
    if (!settings.offline_until) return false
    const offlineUntilMs = Date.parse(settings.offline_until)
    if (!Number.isFinite(offlineUntilMs) || offlineUntilMs > nowMs) return false
  }

  if (settings.suspended_until) {
    const suspendedUntilMs = Date.parse(settings.suspended_until)
    if (!Number.isFinite(suspendedUntilMs) || suspendedUntilMs > nowMs) return false
  }

  return true
}
