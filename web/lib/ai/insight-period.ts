/**
 * Normalize untrusted insight period input and derive one consistent time window.
 * The same range is used for metrics that would otherwise drift or accept raw values.
 */
export type InsightDateRange = {
  days: number
  start: string
  end: string
}

export function getInsightDateRange(
  requestedDays: unknown,
  maxDays = 90,
  nowMs = Date.now(),
): InsightDateRange {
  const safeMaximum = Number.isFinite(maxDays) ? Math.max(1, Math.trunc(maxDays)) : 90
  const fallbackDays = Math.min(30, safeMaximum)
  const requested =
    typeof requestedDays === 'number' && Number.isFinite(requestedDays)
      ? Math.trunc(requestedDays)
      : fallbackDays
  const days = Math.max(1, Math.min(safeMaximum, requested))
  const endMs = Number.isFinite(nowMs) ? nowMs : Date.now()
  const startMs = endMs - days * 24 * 60 * 60 * 1000

  return {
    days,
    start: new Date(startMs).toISOString(),
    end: new Date(endMs).toISOString(),
  }
}
