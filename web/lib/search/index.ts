import type { Business } from '@/lib/data/businesses'
import { normalizeArabic } from './normalize'
import { extractTypes } from './synonyms'

// ═══════════════════════════════════════════════════════════
// EAH — Smart Search
// ═══════════════════════════════════════════════════════════

export type SearchResult = {
  business: Business
  score: number
  matchedOn: 'name' | 'area' | 'description' | 'hook' | 'type'
}

// حساب درجة التطابق
function scoreMatch(business: Business, query: string): SearchResult | null {
  const name = normalizeArabic(business.name)
  const area = normalizeArabic(business.area ?? '')
  const description = normalizeArabic(business.description ?? '')
  const hook = normalizeArabic(business.hook ?? '')

  // تطابق اسم كامل
  if (name === query) {
    return { business, score: 100, matchedOn: 'name' }
  }

  // اسم يحتوي على الـ query
  if (name.includes(query)) {
    const ratio = query.length / name.length
    return { business, score: 70 + ratio * 25, matchedOn: 'name' }
  }

  // hook يحتوي
  if (hook.includes(query)) {
    return { business, score: 55, matchedOn: 'hook' }
  }

  // area
  if (area.includes(query)) {
    return { business, score: 45, matchedOn: 'area' }
  }

  // description
  if (description.includes(query)) {
    return { business, score: 35, matchedOn: 'description' }
  }

  return null
}

// ═══════════════════════════════════════════════════════════
// الدالة الرئيسية
// ═══════════════════════════════════════════════════════════
export function smartSearch(businesses: Business[], rawQuery: string): SearchResult[] {
  const query = normalizeArabic(rawQuery)
  if (!query) return []

  // 1. استخرج الأنواع من الـ synonyms
  const types = extractTypes(rawQuery)

  // 2. لو فيه أنواع → فلترة
  const results: SearchResult[] = []

  if (types.length > 0) {
    for (const b of businesses) {
      if (types.includes(b.business_type)) {
        // بحث إضافي بالاسم
        const nameMatch = scoreMatch(b, query)
        results.push(
          nameMatch ?? {
            business: b,
            score: 50,
            matchedOn: 'type',
          },
        )
      }
    }
  }

  // 3. بحث نصي عادي (لو مفيش نتائج من الأنواع)
  if (results.length === 0) {
    for (const b of businesses) {
      const match = scoreMatch(b, query)
      if (match) results.push(match)
    }
  }

  // 4. ترتيب بالـ score
  return results.sort((a, b) => b.score - a.score)
}

export { normalizeArabic } from './normalize'
export { extractTypes } from './synonyms'
