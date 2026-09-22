import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'

const MAX_HTML_BYTES = 2 * 1024 * 1024
const MAX_REDIRECTS = 3

function isPrivateIpv4(address: string): boolean {
  const parts = address.split('.').map(Number)
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return true
  }

  const [a, b] = parts
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  )
}

function isPrivateIpv6(address: string): boolean {
  const value = address.toLowerCase().split('%')[0]
  if (value === '::' || value === '::1') return true

  const mappedIpv4 = value.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1]
  if (mappedIpv4) return isPrivateIpv4(mappedIpv4)

  return (
    value.startsWith('fc') ||
    value.startsWith('fd') ||
    /^fe[89ab]/.test(value) ||
    value.startsWith('2001:db8:')
  )
}

function isPrivateAddress(address: string): boolean {
  const version = isIP(address)
  if (version === 4) return isPrivateIpv4(address)
  if (version === 6) return isPrivateIpv6(address)
  return true
}

/**
 * Validates collector URLs before the server connects to them.
 * Blocks credentials, uncommon ports, local names and private/link-local IPs.
 */
export async function assertSafeExternalUrl(raw: string): Promise<URL> {
  const url = new URL(raw)
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error('unsupported_protocol')
  }
  if (url.username || url.password) throw new Error('url_credentials_not_allowed')

  const allowedPort = !url.port || (url.protocol === 'https:' ? url.port === '443' : url.port === '80')
  if (!allowedPort) throw new Error('port_not_allowed')

  const hostname = url.hostname.toLowerCase().replace(/\.$/, '')
  if (
    !hostname.includes('.') ||
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname === 'metadata.google.internal'
  ) {
    throw new Error('private_host_not_allowed')
  }

  const directIpVersion = isIP(hostname)
  const addresses = directIpVersion
    ? [{ address: hostname }]
    : await lookup(hostname, { all: true, verbatim: true })

  if (!addresses.length || addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new Error('private_address_not_allowed')
  }

  url.hash = ''
  return url
}

async function readLimitedText(response: Response): Promise<string> {
  const declaredSize = Number(response.headers.get('content-length') ?? 0)
  if (declaredSize > MAX_HTML_BYTES) throw new Error('response_too_large')
  if (!response.body) return ''

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > MAX_HTML_BYTES) {
      await reader.cancel()
      throw new Error('response_too_large')
    }
    chunks.push(value)
  }

  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  return new TextDecoder().decode(bytes)
}

/** Fetches a small HTML page while validating every redirect target. */
export async function fetchSafeExternalHtml(
  raw: string,
  headers: HeadersInit,
): Promise<{ html: string; finalUrl: string }> {
  let current = await assertSafeExternalUrl(raw)

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount++) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 12_000)

    try {
      const response = await fetch(current, {
        headers,
        signal: controller.signal,
        redirect: 'manual',
        cache: 'no-store',
      })

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location')
        if (!location || redirectCount === MAX_REDIRECTS) throw new Error('unsafe_redirect')
        current = await assertSafeExternalUrl(new URL(location, current).toString())
        continue
      }

      if (!response.ok) throw new Error('fetch_failed')
      const contentType = response.headers.get('content-type')?.toLowerCase() ?? ''
      if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
        throw new Error('unsupported_content_type')
      }

      return { html: await readLimitedText(response), finalUrl: current.toString() }
    } finally {
      clearTimeout(timeout)
    }
  }

  throw new Error('too_many_redirects')
}
