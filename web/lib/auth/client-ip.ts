// Resolve the client address from the hosting platform's rewritten header first.
// If unavailable, use the right-most forwarded address (the last proxy-appended hop),
// never the left-most value which may have been supplied by the caller.
export function getTrustedClientIp(headers: { get(name: string): string | null }): string {
  const realIp = headers.get('x-real-ip')?.trim()
  if (realIp) return realIp

  const forwarded = headers.get('x-forwarded-for')
  if (!forwarded) return 'unknown'

  const chain = forwarded
    .split(',')
    .map((address) => address.trim())
    .filter(Boolean)

  return chain[chain.length - 1] ?? 'unknown'
}
