/**
 * Allow only same-origin path references and ordinary HTTP(S) destinations for ads.
 * Never trust a database URL to be safe merely because it came from an admin form.
 */
export function safeAdHref(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null

  const href = value.trim()
  if (!href || /[\\\\\u0000-\u001f\u007f]/.test(href)) return null

  if (href.startsWith('/')) {
    return href.startsWith('//') ? null : href
  }

  let parsed: URL
  try {
    parsed = new URL(href)
  } catch {
    return null
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null
  return parsed.toString()
}
