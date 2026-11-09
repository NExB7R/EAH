// ═══════════════════════════════════════════════════════════
// EAH — Launch Readiness Utils (pure, testable)
// ═══════════════════════════════════════════════════════════

export type ReadinessGrade = {
  label: string
  color: string
  emoji: string
}

/** Convert percentage (0-100) to grade label + color. */
export function getReadinessGrade(percent: number): ReadinessGrade {
  if (percent >= 90) return { label: 'جاهز للإطلاق', color: '#55e7d1', emoji: '🚀' }
  if (percent >= 75) return { label: 'قريب جدًا', color: '#a3f5dc', emoji: '✨' }
  if (percent >= 50) return { label: 'شغل كتير متبقي', color: '#facc15', emoji: '⚠️' }
  return { label: 'محتاج شغل كبير', color: '#ef4444', emoji: '❌' }
}

/** Compute weighted readiness percentage. */
export function computeWeightedPercent(
  items: Array<{ status: 'ready' | 'warning' | 'blocker'; weight: number }>,
): number {
  const totalWeight = items.reduce((s, i) => s + i.weight, 0)
  if (totalWeight === 0) return 0
  const earned = items.reduce(
    (s, i) => s + (i.status === 'ready' ? i.weight : i.status === 'warning' ? i.weight * 0.5 : 0),
    0,
  )
  return Math.round((earned / totalWeight) * 100)
}
