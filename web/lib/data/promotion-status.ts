/** True when an enabled, optional time-bounded placement is still active. */
export function isPromotionActive(
  enabled: boolean,
  expiresAt: unknown,
  now = Date.now(),
): boolean {
  if (!enabled) return false
  if (expiresAt === null || expiresAt === undefined || expiresAt === '') return true
  if (typeof expiresAt !== 'string') return false
  const expiry = new Date(expiresAt).getTime()
  return Number.isFinite(expiry) && expiry >= now
}
