export type OrderAttachment = {
  type: 'image' | 'voice'
  url: string
  size: number
  mime: string
  duration_sec?: number
  expires_at: number
  signature: string
}

export const ORDER_IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
])

export const ORDER_AUDIO_MIMES = new Set([
  'audio/webm',
  'audio/mp4',
  'audio/ogg',
  'audio/mpeg',
  'audio/m4a',
])

const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024
const MAX_VOICE_SECONDS = 60
const MAX_ATTACHMENTS = 5

export function isAllowedOrderAttachmentUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return (
      url.protocol === 'https:' &&
      url.hostname === 'res.cloudinary.com' &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash &&
      url.pathname.includes('/upload/') &&
      url.pathname.includes('/eah/orders/')
    )
  } catch {
    return false
  }
}

export function orderAttachmentSignaturePayload(
  userId: string,
  attachment: Omit<OrderAttachment, 'signature'>,
): string {
  return [
    userId,
    attachment.type,
    attachment.url,
    String(attachment.size),
    attachment.mime,
    attachment.duration_sec === undefined ? '' : String(attachment.duration_sec),
    String(attachment.expires_at),
  ].join('\n')
}

/**
 * Parse and strictly validate data returned by the authenticated upload endpoint.
 * Returns null if any attachment is malformed; callers must not silently accept
 * a partially invalid attachment list.
 */
export function parseOrderAttachments(raw: string | undefined): OrderAttachment[] | null {
  if (!raw?.trim()) return []
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }

  if (!Array.isArray(parsed) || parsed.length > MAX_ATTACHMENTS) return null
  const result: OrderAttachment[] = []

  for (const item of parsed) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return null
    const value = item as Record<string, unknown>
    if (value.type !== 'image' && value.type !== 'voice') return null
    if (typeof value.url !== 'string' || !isAllowedOrderAttachmentUrl(value.url)) return null
    if (
      typeof value.size !== 'number' ||
      !Number.isSafeInteger(value.size) ||
      value.size < 1 ||
      value.size > MAX_ATTACHMENT_BYTES
    ) return null
    if (typeof value.mime !== 'string') return null
    if (value.type === 'image' && !ORDER_IMAGE_MIMES.has(value.mime)) return null
    if (value.type === 'voice' && !ORDER_AUDIO_MIMES.has(value.mime)) return null
    if (
      typeof value.expires_at !== 'number' ||
      !Number.isSafeInteger(value.expires_at) ||
      typeof value.signature !== 'string' ||
      !/^[a-f0-9]{64}$/i.test(value.signature)
    ) return null

    if (value.type === 'voice') {
      if (
        typeof value.duration_sec !== 'number' ||
        !Number.isFinite(value.duration_sec) ||
        value.duration_sec <= 0 ||
        value.duration_sec > MAX_VOICE_SECONDS
      ) return null
      result.push({
        type: 'voice',
        url: value.url,
        size: value.size,
        mime: value.mime,
        duration_sec: value.duration_sec,
        expires_at: value.expires_at,
        signature: value.signature,
      })
    } else {
      if (value.duration_sec !== undefined) return null
      result.push({
        type: 'image',
        url: value.url,
        size: value.size,
        mime: value.mime,
        expires_at: value.expires_at,
        signature: value.signature,
      })
    }
  }

  return result
}
