function toOrigin(value: string | undefined): string | null {
  if (!value?.trim()) return null

  try {
    const candidate = value.includes('://') ? value : `https://${value}`
    return new URL(candidate).origin
  } catch {
    return null
  }
}

export const SITE_URL =
  toOrigin(process.env.NEXT_PUBLIC_SITE_URL) ??
  toOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
  toOrigin(process.env.VERCEL_URL) ??
  'http://localhost:3000'
