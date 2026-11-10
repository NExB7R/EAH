import 'server-only'
import crypto from 'crypto'
import { lookup as dnsLookup } from 'node:dns/promises'
import { Buffer } from 'node:buffer'
import { request as httpsRequest } from 'node:https'
import { isIP } from 'node:net'

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME
const API_KEY = process.env.CLOUDINARY_API_KEY
const API_SECRET = process.env.CLOUDINARY_API_SECRET

export type UploadResult = { ok: true; url: string } | { ok: false; error: string }

function sign(params: Record<string, string | number>, secret: string): string {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&')
  return crypto
    .createHash('sha1')
    .update(sorted + secret)
    .digest('hex')
}

export async function uploadImage(
  file: File,
  folder: string,
  maxSizeBytes = 5 * 1024 * 1024,
): Promise<UploadResult> {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    return { ok: false, error: 'Cloudinary مش مضبوط' }
  }

  if (file.size <= 0 || file.size > maxSizeBytes) {
    return { ok: false, error: 'حجم الصورة غير صالح أو أكبر من المسموح' }
  }

  // Never trust browser-provided MIME type. Inspect the file signature and
  // re-encode its part metadata before forwarding it to the image provider.
  // Only safe raster formats used by EAH uploads are accepted (no SVG/HTML).
  let bytes: Buffer
  try {
    bytes = Buffer.from(await file.arrayBuffer())
  } catch {
    return { ok: false, error: 'تعذر قراءة ملف الصورة' }
  }
  const detectedType = detectRemoteImageType(bytes)
  if (!detectedType) {
    return { ok: false, error: 'محتوى الملف ليس صورة JPEG أو PNG أو WebP أو AVIF صالحة' }
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const params = { folder, timestamp }
  const signature = sign(params, API_SECRET)

  const formData = new FormData()
  formData.append(
    'file',
    new Blob([new Uint8Array(bytes)], { type: detectedType.mimeType }),
    `upload.${detectedType.extension}`,
  )
  formData.append('api_key', API_KEY)
  formData.append('timestamp', String(timestamp))
  formData.append('folder', folder)
  formData.append('signature', signature)

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    })
    const data = (await res.json()) as { secure_url?: string; error?: { message: string } }
    if (!res.ok || !data.secure_url) {
      return { ok: false, error: data.error?.message ?? 'فشل الرفع' }
    }
    return { ok: true, url: data.secure_url }
  } catch {
    return { ok: false, error: 'فشل الاتصال بـ Cloudinary' }
  }
}

const REMOTE_IMAGE_TIMEOUT_MS = 8_000
const REMOTE_MAX_REDIRECTS = 3

type RemoteImageType = {
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif'
  extension: 'jpg' | 'png' | 'webp' | 'avif'
}
type ResolvedAddress = { address: string; family: number }

function ipv6ToBigInt(address: string): bigint | null {
  let value = address.toLowerCase()
  if (value.includes('.')) {
    const separator = value.lastIndexOf(':')
    const ipv4 = value.slice(separator + 1)
    if (isIP(ipv4) !== 4) return null
    const octets = ipv4.split('.').map(Number)
    const first = ((octets[0] ?? 0) << 8) | (octets[1] ?? 0)
    const second = ((octets[2] ?? 0) << 8) | (octets[3] ?? 0)
    value = `${value.slice(0, separator)}:${first.toString(16)}:${second.toString(16)}`
  }

  const separator = value.indexOf('::')
  let groups: string[]
  if (separator >= 0) {
    const left = value.slice(0, separator) ? value.slice(0, separator).split(':') : []
    const right = value.slice(separator + 2) ? value.slice(separator + 2).split(':') : []
    const missing = 8 - left.length - right.length
    if (missing < 1) return null
    groups = [...left, ...Array.from({ length: missing }, () => '0'), ...right]
  } else {
    groups = value.split(':')
  }

  if (groups.length !== 8 || groups.some((group) => !/^[0-9a-f]{1,4}$/.test(group))) {
    return null
  }

  return groups.reduce((result, group) => (result << 16n) | BigInt(parseInt(group, 16)), 0n)
}

/** Reject special-use ranges before fetching remote content. All DNS answers must be public. */
function isPublicAddress(address: string, family: number): boolean {
  const actualFamily = isIP(address)
  if (actualFamily === 4 && family === 4) {
    const octets = address.split('.').map(Number)
    const a = octets[0] ?? 0
    const b = octets[1] ?? 0
    const c = octets[2] ?? 0

    if (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 192 && b === 0 && (c === 0 || c === 2)) ||
      (a === 192 && b === 88 && c === 99) ||
      (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) ||
      (a === 203 && b === 0 && c === 113)
    ) {
      return false
    }
    return true
  }

  if (actualFamily !== 6 || family !== 6 || address.includes('%')) return false
  const normalized = address.toLowerCase()
  if (normalized.startsWith('::ffff:')) return false

  const value = ipv6ToBigInt(normalized)
  if (value === null) return false

  // Accept global unicast only (2000::/3); block documentation, benchmark,
  // ORCHID, Teredo and 6to4 ranges that should not be used as public origins.
  if (value >> 125n !== 1n) return false
  if (value >> 96n === 0x20010db8n) return false // 2001:db8::/32
  if (value >> 80n === 0x200100020000n) return false // 2001:2::/48
  if (value >> 100n === 0x2001001n || value >> 100n === 0x2001002n) return false
  if (value >> 96n === 0x20010000n) return false // 2001::/32 (Teredo)
  if (value >> 112n === 0x2002n) return false // 2002::/16 (6to4)
  return true
}

async function validatePublicHttpsUrl(
  rawUrl: string,
): Promise<{ url: URL; addresses: ResolvedAddress[] }> {
  if (!rawUrl || rawUrl.length > 500) throw new Error('URL length')
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    throw new Error('Invalid URL')
  }

  if (
    url.protocol !== 'https:' ||
    !url.hostname ||
    url.username ||
    url.password ||
    url.hash ||
    (url.port && url.port !== '443')
  ) {
    throw new Error('Only credential-free public HTTPS URLs are allowed')
  }

  const hostname = url.hostname.toLowerCase()
  const unwrappedHost =
    hostname.startsWith('[') && hostname.endsWith(']') ? hostname.slice(1, -1) : hostname

  // Do not accept IP literals or special-use/local hostnames.
  if (
    isIP(unwrappedHost) !== 0 ||
    !hostname.includes('.') ||
    hostname.endsWith('.') ||
    /\.(?:localhost|local|internal|test|invalid|example|onion|home\.arpa)$/i.test(hostname)
  ) {
    throw new Error('Public DNS hostname required')
  }

  const addresses = await dnsLookup(hostname, { all: true, verbatim: true })
  if (
    addresses.length === 0 ||
    addresses.some(({ address, family }) => !isPublicAddress(address, family))
  ) {
    throw new Error('Host must resolve only to public IP addresses')
  }

  return { url, addresses }
}

function detectRemoteImageType(bytes: Buffer): RemoteImageType | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mimeType: 'image/jpeg', extension: 'jpg' }
  }

  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return { mimeType: 'image/png', extension: 'png' }
  }

  if (
    bytes.length >= 12 &&
    bytes.toString('ascii', 0, 4) === 'RIFF' &&
    bytes.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return { mimeType: 'image/webp', extension: 'webp' }
  }

  if (
    bytes.length >= 12 &&
    bytes.toString('ascii', 4, 8) === 'ftyp' &&
    (bytes.subarray(8, Math.min(bytes.length, 32)).includes(Buffer.from('avif')) ||
      bytes.subarray(8, Math.min(bytes.length, 32)).includes(Buffer.from('avis')))
  ) {
    return { mimeType: 'image/avif', extension: 'avif' }
  }

  return null
}

async function downloadRemoteImage(
  rawUrl: string,
  maxSizeBytes: number,
  redirectsRemaining = REMOTE_MAX_REDIRECTS,
): Promise<{ bytes: Buffer; type: RemoteImageType }> {
  const { url, addresses } = await validatePublicHttpsUrl(rawUrl)
  const pinnedLookup = ((
    _hostname: string,
    options: { all?: boolean },
    callback: (
      error: NodeJS.ErrnoException | null,
      address: string | ResolvedAddress[],
      family?: number,
    ) => void,
  ) => {
    // Pin the connection to the public DNS answers we already validated.
    if (options?.all) callback(null, addresses)
    else callback(null, addresses[0]!.address, addresses[0]!.family)
  }) as unknown as NonNullable<import('node:https').RequestOptions['lookup']>

  const response = await new Promise<import('node:http').IncomingMessage>((resolve, reject) => {
    const request = httpsRequest(
      url,
      {
        method: 'GET',
        timeout: REMOTE_IMAGE_TIMEOUT_MS,
        lookup: pinnedLookup,
        headers: {
          accept: 'image/jpeg,image/png,image/webp,image/avif',
          'accept-encoding': 'identity',
          'user-agent': 'EAH-Image-Importer/1.0',
        },
      },
      resolve,
    )
    request.setTimeout(REMOTE_IMAGE_TIMEOUT_MS, () => {
      request.destroy(new Error('Remote image request timed out'))
    })
    request.on('error', reject)
    request.end()
  })

  const status = response.statusCode ?? 0
  if ([301, 302, 303, 307, 308].includes(status)) {
    const locationHeader = response.headers.location
    const location = Array.isArray(locationHeader) ? locationHeader[0] : locationHeader
    response.resume()
    if (!location || redirectsRemaining <= 0) throw new Error('Too many or invalid redirects')
    return downloadRemoteImage(
      new URL(location, url).toString(),
      maxSizeBytes,
      redirectsRemaining - 1,
    )
  }

  if (status !== 200) {
    response.resume()
    throw new Error('Remote image request failed')
  }

  const contentLength = response.headers['content-length']
  if (typeof contentLength === 'string') {
    const declaredSize = Number(contentLength)
    if (Number.isFinite(declaredSize) && declaredSize > maxSizeBytes) {
      response.destroy()
      throw new Error('Remote image exceeds size limit')
    }
  }

  const contentEncoding = response.headers['content-encoding']
  if (contentEncoding && contentEncoding !== 'identity') {
    response.destroy()
    throw new Error('Compressed transfer encodings are not accepted')
  }

  const chunks: Buffer[] = []
  let totalSize = 0
  for await (const chunk of response) {
    const part = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    totalSize += part.length
    if (totalSize > maxSizeBytes) {
      response.destroy()
      throw new Error('Remote image exceeds size limit')
    }
    chunks.push(part)
  }

  const bytes = Buffer.concat(chunks)
  const type = detectRemoteImageType(bytes)
  if (!type) throw new Error('Unsupported or invalid image content')

  const rawContentType = response.headers['content-type']
  const contentType = Array.isArray(rawContentType)
    ? rawContentType[0]?.split(';')[0]?.trim().toLowerCase()
    : rawContentType?.split(';')[0]?.trim().toLowerCase()
  if (
    contentType &&
    !contentType.startsWith('image/') &&
    contentType !== 'application/octet-stream'
  ) {
    throw new Error('Remote resource is not an image')
  }

  return { bytes, type }
}

/**
 * Download a public HTTPS image with DNS pinning, redirect revalidation, byte-size
 * limits and magic-byte validation, then upload its bytes to Cloudinary.
 */
export async function uploadRemoteImage(
  rawUrl: string,
  folder: string,
  maxSizeBytes = 5 * 1024 * 1024,
): Promise<UploadResult> {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    return { ok: false, error: 'Cloudinary مش مضبوط' }
  }

  try {
    const downloaded = await downloadRemoteImage(rawUrl, maxSizeBytes)
    const file = new File(
      [new Uint8Array(downloaded.bytes)],
      `remote.${downloaded.type.extension}`,
      {
        type: downloaded.type.mimeType,
      },
    )
    return uploadImage(file, folder, maxSizeBytes)
  } catch {
    return {
      ok: false,
      error: 'الرابط غير صالح أو لا يشير لصورة مدعومة؛ استخدم HTTPS وصورة أقل من 5MB',
    }
  }
}

// ═══════════════════════════════════════════════════════════
// EAH — Delete Image (Cloudinary signed destroy)
// ═══════════════════════════════════════════════════════════

export type DeleteResult = { ok: true } | { ok: false; error: string }

function extractPublicId(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (parsed.hostname !== 'res.cloudinary.com') return null
    const parts = parsed.pathname.split('/')
    const uploadIdx = parts.indexOf('upload')
    if (uploadIdx < 0) return null
    const rest = parts.slice(uploadIdx + 1).filter(Boolean)
    if (rest.length === 0) return null
    const versionIdx = rest.findIndex((s) => /^v\d+$/.test(s))
    const assetParts = versionIdx >= 0 ? rest.slice(versionIdx + 1) : rest
    if (assetParts.length === 0) return null
    const last = assetParts[assetParts.length - 1]
    if (!last) return null
    const dot = last.lastIndexOf('.')
    if (dot > 0) assetParts[assetParts.length - 1] = last.slice(0, dot)
    return assetParts.join('/')
  } catch {
    return null
  }
}

export async function deleteImage(url: string): Promise<DeleteResult> {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    return { ok: false, error: 'Cloudinary مش مضبوط' }
  }
  const publicId = extractPublicId(url)
  if (!publicId) return { ok: false, error: 'رابط غير صالح أو ليس من Cloudinary' }
  const timestamp = Math.floor(Date.now() / 1000)
  const signature = sign({ public_id: publicId, timestamp }, API_SECRET)
  const body = new URLSearchParams({
    public_id: publicId,
    timestamp: String(timestamp),
    signature,
    api_key: API_KEY,
  })
  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`, {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    if (!res.ok) return { ok: false, error: `Cloudinary HTTP ${res.status}` }
    const json = (await res.json()) as { result?: string }
    if (json.result === 'ok' || json.result === 'not found') return { ok: true }
    return { ok: false, error: `Cloudinary: ${json.result ?? 'unknown'}` }
  } catch {
    return { ok: false, error: 'فشل الاتصال بـ Cloudinary' }
  }
}
