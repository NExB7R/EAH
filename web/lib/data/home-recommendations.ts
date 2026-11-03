import 'server-only'

import { getFavorites, getFollowing, getOrders } from './account'
import { getPublishedBusinesses, type Business } from './businesses'
import { getBusinessReputationScore } from '@/lib/reputation'

const LEARNING_WINDOW_MS = 180 * 24 * 60 * 60 * 1000
const HOME_RECOMMENDATION_LIMIT = 6

type InterestSignal = {
  businessId: string
  businessType: string
  area: string | null
  weight: number
}

export type HomeRecommendations = {
  businesses: Business[]
  description: string
}

function isRecent(createdAt: string, now: number): boolean {
  const timestamp = new Date(createdAt).getTime()
  return Number.isFinite(timestamp) && timestamp <= now && now - timestamp <= LEARNING_WINDOW_MS
}

function diversify(items: Array<{ business: Business; score: number }>, limit: number): Business[] {
  const picked: Business[] = []
  const deferred: Business[] = []
  const perType = new Map<string, number>()

  for (const item of items) {
    if (picked.length >= limit) {
      deferred.push(item.business)
      continue
    }

    const current = perType.get(item.business.business_type) ?? 0
    if (current >= 2) {
      deferred.push(item.business)
      continue
    }

    picked.push(item.business)
    perType.set(item.business.business_type, current + 1)
  }

  if (picked.length < limit) {
    for (const business of deferred) {
      if (picked.length >= limit) break
      picked.push(business)
    }
  }

  return picked
}

/**
 * Builds a conservative home feed only after the signed-in member has shown
 * multiple recent, explicit interests. No random recommendations are shown
 * to guests or new accounts with no usable history.
 */
export async function getHomeRecommendations(
  userId: string,
  preferredArea: string | null,
): Promise<HomeRecommendations> {
  const empty: HomeRecommendations = { businesses: [], description: '' }

  const [favorites, following, orders] = await Promise.all([
    getFavorites(userId),
    getFollowing(userId),
    getOrders(userId),
  ])

  const now = Date.now()
  const recentFavorites = favorites.filter((item) => isRecent(item.created_at, now))
  const recentFollowing = following.filter((item) => isRecent(item.created_at, now))
  const completedOrders = orders.filter(
    (item) => item.status === 'delivered' &&
      isRecent(item.delivered_at ?? item.created_at, now) &&
      !!item.business?.slug,
  )

  // Repeated page visits and account creation alone are not recommendation signals.
  const signalCount = recentFavorites.length + recentFollowing.length + completedOrders.length
  if (signalCount < 2) return empty

  const candidates = await getPublishedBusinesses(1000)
  if (candidates.length === 0) return empty

  const businessBySlug = new Map(candidates.map((business) => [business.slug, business]))
  const signals: InterestSignal[] = []

  for (const item of recentFavorites) {
    signals.push({
      businessId: item.business.id,
      businessType: item.business.business_type,
      area: item.business.area,
      weight: 2,
    })
  }

  for (const item of recentFollowing) {
    signals.push({
      businessId: item.business.id,
      businessType: item.business.business_type,
      area: item.business.area,
      weight: 1.3,
    })
  }

  for (const order of completedOrders) {
    const business = order.business?.slug ? businessBySlug.get(order.business.slug) : undefined
    if (!business) continue
    signals.push({
      businessId: business.id,
      businessType: business.business_type,
      area: business.area,
      weight: 2.5,
    })
  }

  if (signals.length < 2) return empty

  const interactedIds = new Set(signals.map((signal) => signal.businessId))
  const typeWeights = new Map<string, number>()
  const areaWeights = new Map<string, number>()

  for (const signal of signals) {
    typeWeights.set(
      signal.businessType,
      (typeWeights.get(signal.businessType) ?? 0) + signal.weight,
    )
    if (signal.area) {
      areaWeights.set(signal.area, (areaWeights.get(signal.area) ?? 0) + signal.weight)
    }
  }

  if (preferredArea) {
    areaWeights.set(preferredArea, (areaWeights.get(preferredArea) ?? 0) + 0.75)
  }

  const totalTypeWeight = [...typeWeights.values()].reduce((sum, value) => sum + value, 0)
  const totalAreaWeight = [...areaWeights.values()].reduce((sum, value) => sum + value, 0)

  if (totalTypeWeight <= 0 && totalAreaWeight <= 0) return empty

  const ranked = candidates
    .filter((business) => !interactedIds.has(business.id))
    .map((business) => {
      const typeAffinity = totalTypeWeight > 0
        ? (typeWeights.get(business.business_type) ?? 0) / totalTypeWeight
        : 0
      const areaAffinity = totalAreaWeight > 0
        ? (areaWeights.get(business.area ?? '') ?? 0) / totalAreaWeight
        : 0

      // A recommendation must connect to at least one observed preference.
      if (typeAffinity === 0 && areaAffinity === 0) return null

      const reputation = getBusinessReputationScore(business) / 100
      const score =
        typeAffinity * 0.58 +
        areaAffinity * 0.27 +
        reputation * 0.15

      return { business, score }
    })
    .filter((item): item is { business: Business; score: number } => item !== null)
    .sort((a, b) => b.score - a.score || a.business.id.localeCompare(b.business.id))

  const recommendations = diversify(ranked, HOME_RECOMMENDATION_LIMIT)
  if (recommendations.length < 2) return empty

  return {
    businesses: recommendations,
    description: 'اختيارات مبنية على الأنشطة اللي حفظتها وتابعتها وطلباتك السابقة.',
  }
}
