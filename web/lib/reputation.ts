/**
 * EAH public business reputation uses observable evidence only:
 * administrative verification, transaction-based ratings, and completed
 * platform orders. Gamification points never enter this calculation.
 */
export type BusinessReputationEvidence = {
  is_verified?: boolean | null
  rating_avg?: number | null
  rating_count?: number | null
  successful_orders?: number | null
}

function finiteNonNegative(value: number | null | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, value) : 0
}

/**
 * Returns a private 0–100 ranking signal, not a public badge or guarantee.
 * A three-review prior reduces volatility in small samples; confidence scaling
 * makes an empty review set contribute exactly zero rating evidence.
 */
export function getBusinessReputationScore(evidence: BusinessReputationEvidence): number {
  const count = Math.floor(finiteNonNegative(evidence.rating_count))
  const average = Math.min(5, finiteNonNegative(evidence.rating_avg))
  const completedOrders = Math.floor(finiteNonNegative(evidence.successful_orders))

  const priorRating = 4
  const priorWeight = 3
  const confidence = count / (count + priorWeight)
  const smoothedRating = (average * count + priorRating * priorWeight) / (count + priorWeight)
  const ratingEvidence = 50 * (smoothedRating / 5) * confidence
  const orderEvidence = 30 * (completedOrders / (completedOrders + 10))
  const verificationEvidence = evidence.is_verified === true ? 20 : 0

  return Math.round(Math.min(100, verificationEvidence + ratingEvidence + orderEvidence) * 10) / 10
}
