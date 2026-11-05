/**
 * Return the public business route only after the business is published.
 * Draft/rejected activities remain accessible through admin preview, not public links.
 */
export function getPublishedBusinessHref(
  isPublished: boolean,
  slug: string,
): string | null {
  if (!isPublished || !slug.trim()) return null
  return `/businesses/${slug}`
}
