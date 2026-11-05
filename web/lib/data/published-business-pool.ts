const MAX_PUBLISHED_BUSINESSES = 500
const DEFAULT_PUBLISHED_BUSINESSES = 100

/** Keep broad public discovery bounded; callers such as the home page use the lighter default. */
export function getPublishedBusinessLimit(requested = DEFAULT_PUBLISHED_BUSINESSES): number {
  if (!Number.isFinite(requested)) return DEFAULT_PUBLISHED_BUSINESSES
  return Math.min(MAX_PUBLISHED_BUSINESSES, Math.max(1, Math.floor(requested)))
}

/**
 * Defense in depth: drafts must never enter any public discovery/search pool.
 * The query selects is_published explicitly; the generated Supabase row type
 * does not currently expose that column, so inspect it through a narrow runtime cast.
 */
export function onlyPublishedBusinessRows<T extends object>(rows: T[] | null): T[] {
  return (rows ?? []).filter(
    (row) => (row as { is_published?: unknown }).is_published === true,
  )
}
