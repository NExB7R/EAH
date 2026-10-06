// ═══════════════════════════════════════════════════════════
// EAH — Fair Offers Rotation
// كل تاجر ياخد فرصة — مش نفس الـ 3 دايمًا
// CRITERIA §4: 3 الأحدث + 3 الأعلى trust + 2 Round-Robin
// ═══════════════════════════════════════════════════════════

import type { Offer } from '@/lib/data/businesses'
import { dailyShuffle } from '@/lib/ranking'

export function fairRotateOffers(offers: Offer[], limit = 8): Offer[] {
  if (offers.length <= limit) return offers

  const picked = new Set<string>()
  const seenBusinesses = new Set<string>()
  const result: Offer[] = []

  // 1) أول 3 slots — الأحدث (تاجر واحد ما ياخدش أكتر من slot)
  const byRecent = [...offers].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )
  for (const o of byRecent) {
    if (result.length >= 3) break
    const bizId = o.business?.id ?? o.id
    if (seenBusinesses.has(bizId)) continue
    seenBusinesses.add(bizId)
    picked.add(o.id)
    result.push(o)
  }

  // 2) تاني 3 slots — الأعلى trust (تاجر مختلف كمان)
  const byTrust = [...offers].sort((a, b) => {
    const ta = a.business?.trust_score ?? 0
    const tb = b.business?.trust_score ?? 0
    return tb - ta
  })
  for (const o of byTrust) {
    if (result.length >= 6) break
    if (picked.has(o.id)) continue
    const bizId = o.business?.id ?? o.id
    if (seenBusinesses.has(bizId)) continue
    seenBusinesses.add(bizId)
    picked.add(o.id)
    result.push(o)
  }

  // 3) آخر slotين — Round-Robin (باقي بترتيب ثابت يومي — مش random كل request)
  const remaining = offers.filter((o) => !picked.has(o.id))
  const shuffled = dailyShuffle(remaining)
  for (const o of shuffled) {
    if (result.length >= limit) break
    picked.add(o.id)
    result.push(o)
  }

  return result
}
