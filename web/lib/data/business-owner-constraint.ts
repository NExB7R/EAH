export type DatabaseConstraintError = {
  code?: string
  message?: string
  details?: string | null
  hint?: string | null
} | null | undefined

/**
 * Identifies the database-level one-business-per-owner constraint.
 * Keep unrelated unique conflicts (for example duplicate slugs) distinct.
 */
export function isBusinessOwnerUniqueConflict(
  error: DatabaseConstraintError,
): boolean {
  if (error?.code !== '23505') return false

  const context = [error.message, error.details, error.hint]
    .filter((value): value is string => Boolean(value))
    .join(' ')
    .toLowerCase()

  return (
    context.includes('businesses_one_owner_per_account_idx') ||
    context.includes('(owner_profile_id)')
  )
}
