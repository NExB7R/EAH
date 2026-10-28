import type { Business } from '@/lib/data/businesses'
import { cachedNormalize, tokenize } from './normalize'
import { extractTypes } from './synonyms'
import { getBusinessReputationScore } from '@/lib/reputation'

// ═══════════════════════════════════════════════════════════
// EAH — Smart Search v2
//   • Word-level matching
//   • Fix bug: نفلتر بالـ type أولاً، ثم نرتّب بالاسم
//   • Fuzzy matching (typos)
//   • Secondary ranking (availability + evidence-based business reputation)
//   • Intent detection
// ═══════════════════════════════════════════════════════════

export type SearchIntent = 'quality' | 'nearby' | 'open_now' | 'general'

export type SearchResult = {
  business: Business
  score: number
  matchedOn: 'name' | 'area' | 'description' | 'hook' | 'type'
}

// ─── Levenshtein Distance (للتسامح مع الأخطاء) ───

function levenshtein(a: string, b: string, max = 3): number {
  if (Math.abs(a.length - b.length) > max) return max + 1
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length

  const m = a.length
  const n = b.length
  const row = new Array<number>(n + 1)

  for (let j = 0; j <= n; j++) row[j] = j

  for (let i = 1; i <= m; i++) {
    let prev = row[0]!
    row[0] = i
    for (let j = 1; j <= n; j++) {
      const temp = row[j]!
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      row[j] = Math.min(row[j]! + 1, row[j - 1]! + 1, prev + cost)
      prev = temp
    }
  }
  return row[n]!
}

// ─── Fuzzy match: هل كلمة تشبه كلمة تانية؟ ───

function fuzzyMatch(word: string, target: string): number {
  // 0 = no match, 1 = perfect, 0.5 = fuzzy
  if (word === target) return 1
  if (target.includes(word) && word.length >= 3) return 0.9
  if (word.includes(target) && target.length >= 3) return 0.8

  const dist = levenshtein(word, target, 2)
  if (dist <= 1 && word.length >= 4) return 0.7
  if (dist <= 2 && word.length >= 5) return 0.5
  return 0
}

// ─── Score لكل نشاط ───

function scoreBusiness(
  business: Business,
  tokens: string[],
  fullQuery: string,
): SearchResult | null {
  if (tokens.length === 0) return null

  const name = cachedNormalize(business.name)
  const area = cachedNormalize(business.area ?? '')
  const description = cachedNormalize(business.description ?? '')
  const hook = cachedNormalize(business.hook ?? '')

  // full match الأول
  if (name === fullQuery) {
    return { business, score: 100, matchedOn: 'name' }
  }

  let totalScore = 0
  let matchedTokens = 0
  let bestField: SearchResult['matchedOn'] = 'name'

  const nameTokens = name.split(' ')
  const areaTokens = area.split(' ')
  const descTokens = description.split(' ')
  const hookTokens = hook.split(' ')

  for (const token of tokens) {
    let bestTokenScore = 0
    let field: SearchResult['matchedOn'] = 'name'

    // 1) الاسم (الأولوية القصوى)
    for (const nt of nameTokens) {
      const s = fuzzyMatch(token, nt)
      if (s * 100 > bestTokenScore) {
        bestTokenScore = s * 100
        field = 'name'
      }
    }

    // 2) hook
    if (bestTokenScore < 55) {
      for (const ht of hookTokens) {
        const s = fuzzyMatch(token, ht)
        if (s * 60 > bestTokenScore) {
          bestTokenScore = s * 60
          field = 'hook'
        }
      }
    }

    // 3) area
    if (bestTokenScore < 45) {
      for (const at of areaTokens) {
        const s = fuzzyMatch(token, at)
        if (s * 50 > bestTokenScore) {
          bestTokenScore = s * 50
          field = 'area'
        }
      }
    }

    // 4) description
    if (bestTokenScore < 35) {
      for (const dt of descTokens) {
        const s = fuzzyMatch(token, dt)
        if (s * 40 > bestTokenScore) {
          bestTokenScore = s * 40
          field = 'description'
        }
      }
    }

    if (bestTokenScore > 0) {
      totalScore += bestTokenScore
      matchedTokens++
      if (bestTokenScore > 70) bestField = field
    }
  }

  if (matchedTokens === 0) return null

  // متوسط + مكافأة للكلمات المطابقة
  const avgScore = totalScore / tokens.length
  const coverage = matchedTokens / tokens.length
  const bonus = coverage === 1 ? 15 : coverage >= 0.5 ? 5 : 0

  return {
    business,
    score: Math.min(100, avgScore + bonus),
    matchedOn: bestField,
  }
}

// ─── Secondary ranking (بعد الـ score) ───

function secondaryScore(b: Business): number {
  let s = 0
  if (b.is_open) s += 30
  if (b.is_featured) s += 15
  s += getBusinessReputationScore(b) * 0.3
  return s
}

// ─── Intent detection ───

function detectIntent(query: string): SearchIntent {
  const q = cachedNormalize(query)
  if (/افتح|مفتوح|دلوقتي|حالا|شغال/.test(q)) return 'open_now'
  if (/احسن|افضل|اجمد|نضيف/.test(q)) return 'quality'
  if (/قريب|جنبي|حولي|هنا/.test(q)) return 'nearby'
  return 'general'
}

// ─── الدالة الرئيسية ───

export function smartSearch(businesses: Business[], rawQuery: string, limit = 100): SearchResult[] {
  const safeLimit = Math.min(Math.max(1, limit), 200)
  const q = rawQuery.trim()
  if (!q) return []

  const query = cachedNormalize(q)
  if (!query) return []

  const tokens = tokenize(q)
  if (tokens.length === 0) return []

  const types = extractTypes(q)
  const intent = detectIntent(q)

  // ─── 1) فلترة بالأنواع (لو موجودة) ───
  let pool: Business[]
  let typeFiltered = false

  if (types.length > 0) {
    pool = businesses.filter((b) => types.includes(b.business_type))
    if (pool.length > 0) {
      typeFiltered = true
    } else {
      pool = businesses
    }
  } else {
    pool = businesses
  }

  // ─── 2) Score ───
  const results: SearchResult[] = []

  for (const b of pool) {
    if (typeFiltered) {
      // النشاط مطابق للنوع — نعطيه score أساسي
      const nameMatch = scoreBusiness(b, tokens, query)
      if (nameMatch) {
        results.push(nameMatch)
      } else {
        // لو مش مطابق بالاسم، نعطيه score حسب النوع
        results.push({
          business: b,
          score: 50,
          matchedOn: 'type',
        })
      }
    } else {
      const match = scoreBusiness(b, tokens, query)
      if (match) results.push(match)
    }
  }

  // ─── 3) Fallback ───
  if (results.length === 0 && types.length > 0) {
    for (const b of businesses) {
      if (types.includes(b.business_type)) {
        results.push({ business: b, score: 50, matchedOn: 'type' })
      }
    }
  }

  // ─── 4) Sort ───
  results.sort((a, b) => {
    // 1) score
    if (Math.abs(a.score - b.score) > 5) return b.score - a.score

    // 2) حسب النية
    if (intent === 'open_now') {
      const diff = Number(b.business.is_open) - Number(a.business.is_open)
      if (diff !== 0) return diff
    }

    // 3) secondary
    const sa = secondaryScore(a.business)
    const sb = secondaryScore(b.business)
    if (Math.abs(sa - sb) > 5) return sb - sa

    // 4) score مرة تانية (لو التعادل)
    return b.score - a.score
  })

  return results.slice(0, safeLimit)
}
