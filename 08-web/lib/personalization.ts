/**
 * EAH Personalization Layer
 * -------------------------
 * طبقة فوق lib/ranking.ts — تقرأ tags من profiles.interests
 * وتضيف boosts مدروسة بدون ما تكسر الترتيب الأساسي.
 *
 * Tag format (from onboarding):
 *   - Category: "restaurant" | "pharmacy" | "delivery" | "supermarket" | "coffee"
 *   - Feature:  "offers" | "new" | "trends"
 *   - Area:     "area:shibin" | "area:qalag" | ...
 *   - Budget:   "budget:low" | "budget:mid" | "budget:high"
 */

import { createClient } from './supabase-server'

export type UserProfile = {
  area?: string
  budget?: 'low' | 'mid' | 'high'
  categories: string[]
  wantsOffers: boolean
  wantsNew: boolean
  wantsTrends: boolean
  raw: string[]
}

const CATEGORY_KEYS = ['restaurant', 'pharmacy', 'delivery', 'supermarket', 'coffee'] as const

export function parseUserTags(tags: string[]): UserProfile {
  const profile: UserProfile = {
    categories: [],
    wantsOffers: false,
    wantsNew: false,
    wantsTrends: false,
    raw: [...tags],
  }
  for (const raw of tags) {
    if (typeof raw !== 'string') continue
    const tag = raw.trim()
    if (tag.startsWith('area:')) {
      profile.area = tag.slice(5).toLowerCase()
    } else if (tag.startsWith('budget:')) {
      const b = tag.slice(7).toLowerCase()
      if (b === 'low' || b === 'mid' || b === 'high') profile.budget = b
    } else if ((CATEGORY_KEYS as readonly string[]).includes(tag)) {
      profile.categories.push(tag)
    } else if (tag === 'offers') profile.wantsOffers = true
    else if (tag === 'new') profile.wantsNew = true
    else if (tag === 'trends') profile.wantsTrends = true
  }
  return profile
}

export async function loadUserProfileTags(): Promise<string[]> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []
    const { data } = await supabase
      .from('profiles')
      .select('interests')
      .eq('id', user.id)
      .maybeSingle()
    const interests = (data as { interests?: unknown } | null)?.interests
    if (!Array.isArray(interests)) return []
    return interests.filter((x): x is string => typeof x === 'string')
  } catch {
    return []
  }
}

export const PERSONALIZATION_BOOSTS = {
  categoryMatch: 0.15,
  areaMatch: 0.10,
  offersMatch: 0.06,
  newMatch: 0.05,
  trendsMatch: 0.05,
} as const

const CATEGORY_ALIASES: Record<string, string[]> = {
  restaurant: ['restaurant'],
  pharmacy: ['pharmacy'],
  delivery: ['delivery', 'delivery_office'],
  supermarket: ['supermarket', 'grocery', 'market'],
  coffee: ['cafe', 'coffee', 'coffee_shop'],
}

type HasScore = { score: number; reason: string }

export function applyPersonalization<T extends HasScore>(
  items: T[],
  profile: UserProfile
): (T & { rank: number })[] {
  const active =
    Boolean(profile.area) ||
    profile.categories.length > 0 ||
    profile.wantsOffers ||
    profile.wantsNew ||
    profile.wantsTrends

  if (!active || items.length === 0) {
    return items.map((item, i) => ({ ...item, rank: i + 1 }))
  }

  const wanted = new Set(profile.categories)
  const wantedArea = profile.area

  const boosted = items.map((item) => {
    const it = item as unknown as {
      business_type?: string
      type?: string
      area?: string
      city?: string
      activeOffers?: number
      ageInDays?: number
      recentViews?: number
    }

    let boost = 0
    let reason = item.reason

    const bt = (it.business_type ?? it.type ?? '').toLowerCase()
    if (bt) {
      for (const cat of wanted) {
        const aliases = CATEGORY_ALIASES[cat] ?? [cat]
        if (aliases.includes(bt)) {
          boost += PERSONALIZATION_BOOSTS.categoryMatch
          reason = 'من اختياراتك'
          break
        }
      }
    }

    if (wantedArea) {
      const a = (it.area ?? '').toLowerCase()
      const c = (it.city ?? '').toLowerCase()
      if (a.includes(wantedArea) || c.includes(wantedArea)) {
        boost += PERSONALIZATION_BOOSTS.areaMatch
        if (reason === 'مختار لك') reason = 'قريب منك'
      }
    }

    if (profile.wantsOffers && (it.activeOffers ?? 0) > 0) {
      boost += PERSONALIZATION_BOOSTS.offersMatch
    }
    if (profile.wantsNew && (it.ageInDays ?? 999) < 30) {
      boost += PERSONALIZATION_BOOSTS.newMatch
      if (reason === 'مختار لك') reason = 'جديد'
    }
    if (profile.wantsTrends && (it.recentViews ?? 0) > 100) {
      boost += PERSONALIZATION_BOOSTS.trendsMatch
    }

    return { ...item, score: item.score + boost, reason }
  })

  boosted.sort((a, b) => b.score - a.score)
  return boosted.map((item, i) => ({ ...item, rank: i + 1 }))
}
