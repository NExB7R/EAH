export type FairRotationCursor = {
  cursor: number
  restart: boolean
}

/** Returns a non-wrapping page; the final page may intentionally be partial. */
export function sliceFairRotation<T>(
  order: readonly T[],
  start: number,
  size: number,
): T[] {
  const safeStart = Math.max(0, Math.floor(start))
  const safeSize = Math.max(0, Math.floor(size))
  if (safeSize === 0 || safeStart >= order.length) return []
  return order.slice(safeStart, safeStart + safeSize)
}

/**
 * Advances by the number of cards actually shown, not by the current viewport
 * page size. This prevents early repeats if a visitor resizes mid-cycle.
 */
export function getNextFairRotationCursor(
  totalItems: number,
  cursor: number,
  visibleCount: number,
): FairRotationCursor {
  const total = Math.max(0, Math.floor(totalItems))
  if (total === 0) return { cursor: 0, restart: true }

  const start = Math.max(0, Math.floor(cursor))
  const shown = Math.max(0, Math.floor(visibleCount))
  const next = start + shown

  return next >= total
    ? { cursor: 0, restart: true }
    : { cursor: next, restart: false }
}

/** Safely restores a persisted cursor after validating the current item list. */
export function clampFairRotationCursor(totalItems: number, cursor: number): number {
  const total = Math.max(0, Math.floor(totalItems))
  if (total === 0 || !Number.isFinite(cursor)) return 0
  return Math.max(0, Math.min(Math.floor(cursor), total - 1))
}
