import { idbGet, idbSet, idbGetAll, idbDelete, STORES } from './db'
import type { BusinessDetail } from '@/lib/data/business-detail'

// ═══════════════════════════════════════════════════════════
// EAH — Offline Businesses Cache
// آخر 20 نشاط بزيارة — يتم استرجاعهم offline
// ═══════════════════════════════════════════════════════════

const MAX_CACHED = 20
const TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 يوم

type CachedEntry = {
  slug: string
  detail: BusinessDetail
  cachedAt: number
}

export async function cacheBusinessDetail(slug: string, detail: BusinessDetail): Promise<void> {
  const entry: CachedEntry = { slug, detail, cachedAt: Date.now() }
  await idbSet(STORES.businesses, entry)

  // احذف الأقدم لو زاد عن الحد
  const all = await idbGetAll<CachedEntry>(STORES.businesses)
  if (all.length > MAX_CACHED) {
    const sorted = all.sort((a, b) => a.cachedAt - b.cachedAt)
    const toDelete = sorted.slice(0, all.length - MAX_CACHED)
    for (const e of toDelete) {
      await idbDelete(STORES.businesses, e.slug)
    }
  }
}

export async function getCachedBusiness(slug: string): Promise<BusinessDetail | null> {
  const entry = await idbGet<CachedEntry>(STORES.businesses, slug)
  if (!entry) return null
  if (Date.now() - entry.cachedAt > TTL_MS) {
    await idbDelete(STORES.businesses, slug)
    return null
  }
  return entry.detail
}

export async function getAllCachedSlugs(): Promise<string[]> {
  const all = await idbGetAll<CachedEntry>(STORES.businesses)
  return all.map((e) => e.slug)
}
