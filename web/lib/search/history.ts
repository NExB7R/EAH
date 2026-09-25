// ═══════════════════════════════════════════════════════════
// EAH — Search History (localStorage)
// ═══════════════════════════════════════════════════════════

const KEY = 'eah-search-history'
const MAX = 10

export function getHistory(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((x): x is string => typeof x === 'string').slice(0, MAX)
  } catch {
    return []
  }
}

export function addToHistory(query: string): string[] {
  if (typeof window === 'undefined') return []
  const trimmed = query.trim()
  if (!trimmed) return getHistory()

  const current = getHistory()
  const filtered = current.filter((q) => q !== trimmed)
  const next = [trimmed, ...filtered].slice(0, MAX)

  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // quota error — نتجاهل
  }
  return next
}

export function removeFromHistory(query: string): string[] {
  if (typeof window === 'undefined') return []
  const next = getHistory().filter((q) => q !== query)
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // نتجاهل
  }
  return next
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(KEY)
  } catch {
    // نتجاهل
  }
}
