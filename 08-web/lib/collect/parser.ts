/**
 * EAH — Smart Extractor
 * يستخرج معلومات من HTML (og tags + JSON-LD + regex fallback)
 */

export type ExtractedData = {
  name: string
  description: string
  image: string
  sourceUrl: string
  phones: string[]
  whatsapp: string | null
  address: string | null
  hours: string | null
  type: 'restaurant' | 'pharmacy' | 'supermarket' | 'delivery_office' | null
  hasDelivery: boolean
  cuisine: string | null
  score: number
  facebook: string | null
  instagram: string | null
  website: string | null
  tiktok: string | null
  email: string | null
}

const EG_MOBILE = /(?:\+?20|0)?1[0125]\d{8}/g
const EG_LANDLINE = /(?:\+?20|0)?(?:13|23|24|25|26|27|28|29)\d{7}/g

function decodeHtmlEntities(raw: string): string {
  if (!raw) return raw
  const named: Record<string, string> = {
    amp: '&', lt: '<', gt: '>', quot: '"', apos: "'",
    nbsp: '\u00a0', copy: '©', reg: '®', trade: '™',
    hellip: '…', mdash: '—', ndash: '–',
    laquo: '«', raquo: '»', lsaquo: '‹', rsaquo: '›',
    bull: '•', middot: '·', deg: '°', times: '×',
  }
  return raw
    // hex: &#x633;
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => {
      try { return String.fromCodePoint(parseInt(h, 16)) } catch { return _ }
    })
    // decimal: &#1587;
    .replace(/&#(\d+);/g, (_, d) => {
      try { return String.fromCodePoint(parseInt(d, 10)) } catch { return _ }
    })
    // named
    .replace(/&([a-zA-Z]+);/g, (m, n) => named[n] ?? m)
    // extra: bad escaping like \u0627
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => {
      try { return String.fromCharCode(parseInt(h, 16)) } catch { return _ }
    })
}

function extractMeta(html: string, patterns: RegExp[]): string | null {
  for (const p of patterns) {
    const m = html.match(p)
    if (m?.[1]) return decodeHtmlEntities(m[1].trim())
  }
  return null
}

function extractOg(html: string, prop: string): string | null {
  return extractMeta(html, [
    new RegExp('<meta[^>]+property=["\']og:' + prop + '["\'][^>]+content=["\']([^"\']+)["\']', 'i'),
    new RegExp('<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:' + prop + '["\']', 'i'),
  ])
}

function extractTwitter(html: string, prop: string): string | null {
  return extractMeta(html, [
    new RegExp('<meta[^>]+name=["\']twitter:' + prop + '["\'][^>]+content=["\']([^"\']+)["\']', 'i'),
    new RegExp('<meta[^>]+content=["\']([^"\']+)["\'][^>]+name=["\']twitter:' + prop + '["\']', 'i'),
  ])
}

function extractJsonLd(html: string): any[] {
  const results: any[] = []
  const re = /<script[^>]+type=["\']application\/ld\+json["\'][^>]*>([\s\S]*?)<\/script>/gi
  let m
  while ((m = re.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(m[1])
      if (Array.isArray(parsed)) results.push(...parsed)
      else results.push(parsed)
    } catch { /* skip */ }
  }
  return results
}

function detectType(text: string): ExtractedData['type'] {
  const t = text.toLowerCase()
  if (/(صيدلية|صيدليات|pharmacy|دواء|أدوية)/i.test(t)) return 'pharmacy'
  if (/(سوبرماركت|سوبر ماركت|ماركت|بقالة|supermarket|grocery|هايبر)/i.test(t)) return 'supermarket'
  if (/(توصيل|دليفري|ديليفري|delivery|مكتب توصيل)/i.test(t) && !/(مطعم|صيدلية)/i.test(t)) return 'delivery_office'
  if (/(مطعم|مطاعم|كافيه|كافي|قهوة|بيتزا|مشويات|شاورما|برجر|فول|طعمية|أكل|طعام|food|restaurant|cafe|حلويات|فطير)/i.test(t)) return 'restaurant'
  return null
}

function detectDelivery(text: string): boolean {
  return /(توصيل|دليفري|ديليفري|delivery|بنوصل|بيوصل|نوصل|توصيل للبيت|بنوصّل)/i.test(text)
}

function detectCuisine(text: string): string | null {
  const cuisines = [
    'مشويات', 'بيتزا', 'شاورما', 'برجر', 'فول وطعمية', 'أسماك', 'سمك',
    'كافيه', 'قهوة', 'حلويات', 'كشري', 'دجاج', 'فراخ', 'لحوم',
    'شعبي', 'سوشي', 'مأكولات بحرية', 'شرقي', 'غربي'
  ]
  for (const c of cuisines) {
    if (text.includes(c)) return c
  }
  return null
}

function extractAddress(text: string): string | null {
  const patterns = [
    /(شارع\s+[^\n.,،]+)/i,
    /(ميدان\s+[^\n.,،]+)/i,
    /(بجوار\s+[^\n.,،]+)/i,
    /(أمام\s+[^\n.,،]+)/i,
    /(خلف\s+[^\n.,،]+)/i,
    /(بعد\s+[^\n.,،]+)/i,
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m?.[1]) return m[1].trim().slice(0, 120)
  }
  return null
}

function extractHours(text: string): string | null {
  const patterns = [
    /(يومي[اً]?\s+من\s+[^\n،.]+)/i,
    /(من\s+\d{1,2}(?::\d{2})?\s+(?:ص|م|صباح[اً]?|مساء[اً]?)\s+[^\n،.]+)/i,
    /(24\s*ساعة)/i,
    /(مفتوح\s+[^\n،.]+)/i,
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m?.[1]) return m[1].trim().slice(0, 120)
  }
  return null
}

export function extractFromHtml(html: string, sourceUrl: string): ExtractedData {
  const ogTitle = extractOg(html, 'title') || extractTwitter(html, 'title')
  const ogDesc = extractOg(html, 'description') || extractTwitter(html, 'description')
  const ogImage = extractOg(html, 'image') || extractTwitter(html, 'image')
  const ogUrl = extractOg(html, 'url')

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  const rawTitle = ogTitle || titleMatch?.[1] || ''

  const name = rawTitle
    .replace(/\s*[\|\-–—]\s*(?:Facebook|فيسبوك|Instagram|إنستجرام|Meta).*$/i, '')
    .replace(/\s*[\|\-–—]\s*Log\s*(?:in|into).*$/i, '')
    .replace(/\s*[\|\-–—]\s*تسجيل\s+الدخول.*$/i, '')
    .trim()
    .slice(0, 120)

  const safeDesc = decodeHtmlEntities(ogDesc || '')
  const fullText = [name, safeDesc, sourceUrl].join('\n')

  const jsonLd = extractJsonLd(html)
  let ldName = ''
  let ldAddress = ''
  let ldPhone = ''
  let ldCuisine = ''

  for (const item of jsonLd) {
    if (item['@type'] === 'LocalBusiness' || item['@type'] === 'Restaurant' || item['@type'] === 'FoodEstablishment') {
      if (item.name) ldName = String(item.name)
      if (item.address) {
        ldAddress = typeof item.address === 'string'
          ? item.address
          : [item.address.streetAddress, item.address.addressLocality].filter(Boolean).join(', ')
      }
      if (item.telephone) ldPhone = String(item.telephone)
      if (item.servesCuisine) ldCuisine = String(item.servesCuisine)
    }
  }

  const mobileMatches = html.match(EG_MOBILE) || []
  const landlineMatches = html.match(EG_LANDLINE) || []
  const allPhones = Array.from(new Set([...mobileMatches, ...landlineMatches]))
    .map((p) => p.replace(/\s/g, ''))
    .slice(0, 6)

  let whatsapp: string | null = null
  if (allPhones.length > 0) {
    const first = allPhones[0].replace(/\D/g, '')
    if (first.length >= 10 && first.length <= 13) {
      whatsapp = first.startsWith('0') ? '2' + first : first
    }
  }

  const type = detectType(fullText)
  const address = ldAddress || extractAddress(fullText)
  const hours = extractHours(fullText)
  const hasDelivery = detectDelivery(fullText)
  const cuisine = ldCuisine || detectCuisine(fullText)

  let score = 0
  if (name && name.length > 2) score += 25
  if (ogDesc && ogDesc.length > 10) score += 15
  if (ogImage) score += 15
  if (allPhones.length > 0) score += 20
  if (type) score += 10
  if (hasDelivery) score += 5
  if (address) score += 5
  if (hours) score += 5
  if (cuisine) score += 5
  score = Math.min(100, score)

  return {
    name: ldName || name,
    description: decodeHtmlEntities(ogDesc || '').slice(0, 500),
    image: ogImage || '',
    sourceUrl: ogUrl || sourceUrl,
    phones: allPhones,
    whatsapp,
    address,
    hours,
    type,
    hasDelivery,
    cuisine,
    facebook: extractFacebook(html),
    instagram: extractInstagram(html),
    website: extractWebsite(html),
    tiktok: extractTikTok(html),
    email: extractEmail(html),
    score,
  }
}

function extractFacebook(html: string): string | null {
  const m = html.match(/https?:\/\/(?:www\.)?facebook\.com\/[A-Za-z0-9._-]{3,60}/i)
  return m?.[0] ?? null
}

function extractInstagram(html: string): string | null {
  const m = html.match(/https?:\/\/(?:www\.)?instagram\.com\/[A-Za-z0-9._-]{3,60}/i)
  return m?.[0] ?? null
}

function extractTikTok(html: string): string | null {
  const m = html.match(/https?:\/\/(?:www\.)?tiktok\.com\/@[A-Za-z0-9._-]{3,60}/i)
  return m?.[0] ?? null
}

function extractWebsite(html: string): string | null {
  const m = html.match(/https?:\/\/(?!.*(?:facebook|instagram|tiktok|fb\.com))[A-Za-z0-9.-]+\.[A-Za-z]{2,}(?:\/[^\s"'<>]*)?/i)
  if (!m) return null
  const url = m[0]
  if (url.match(/\.(?:jpg|png|gif|webp|svg|css|js)/i)) return null
  return url
}

function extractEmail(html: string): string | null {
  const m = html.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/i)
  return m?.[0] ?? null
}


// استخراج اسم + إحداثيات من رابط Google Maps
export function extractFromMapsUrl(url: string): {
  name: string | null
  lat: number | null
  lng: number | null
  address: string | null
} {
  const result: { name: string | null; lat: number | null; lng: number | null; address: string | null } = {
    name: null, lat: null, lng: null, address: null,
  }
  try {
    const decoded = decodeURIComponent(url)
    // /place/اسم/  — الاسم
    const placeMatch = decoded.match(/\/place\/([^/@?]+)/)
    if (placeMatch) result.name = placeMatch[1].replace(/\+/g, ' ').trim()
    // @lat,lng,
    const atMatch = decoded.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (atMatch) {
      result.lat = parseFloat(atMatch[1])
      result.lng = parseFloat(atMatch[2])
    }
    // ?q=lat,lng
    const qMatch = decoded.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (qMatch && result.lat === null) {
      result.lat = parseFloat(qMatch[1])
      result.lng = parseFloat(qMatch[2])
    }
    // address
    const addrMatch = decoded.match(/\/place\/[^/]+\/([^@?]+)/)
    if (addrMatch) result.address = addrMatch[1].replace(/\+/g, ' ').trim()
  } catch { /* silent */ }
  return result
}
