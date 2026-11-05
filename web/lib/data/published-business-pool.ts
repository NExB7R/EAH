const MAX_PUBLISHED_BUSINESSES = 500
const DEFAULT_PUBLISHED_BUSINESSES = 100

/** Keep broad public discovery bounded; callers such as the home page use the lighter default. */
export function getPublishedBusinessLimit(requested = DEFAULT_PUBLISHED_BUSINESSES): number {
  if (!Number.isFinite(requested)) return DEFAULT_PUBLISHED_BUSINESSES
  return Math.min(MAX_PUBLISHED_BUSINESSES, Math.max(1, Math.floor(requested)))
}

/** Defense in depth: drafts must never enter any public discovery/search pool. */
export function onlyPublishedBusinessRows<T extends { is_published?: unknown }>(
  rows: T[] | null,
): T[] {
  return (rows ?? []).filter((row) => row.is_published === true)
}
