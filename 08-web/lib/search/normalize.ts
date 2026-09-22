// Arabic normalization and intent parsing for Egyptian search queries.
export function normalizeArabic(raw: string): string {
  return raw
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/\u0640/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

export const TYPE_SYNONYMS: Record<string, string[]> = {
  restaurant: [
    'مطعم', 'مطاعم', 'اكل', 'آكل', 'ماكل', 'جعان', 'جعانه', 'نفسي في حاجه', 'نفسي في حاجة',
    'كباب', 'كفته', 'مشويات', 'فراخ', 'لحمه', 'بيتزا', 'برجر', 'ساندوتش', 'سندوتش', 'شاورما',
    'فول', 'طعميه', 'فلافل', 'كشري', 'مكرونه', 'سمك', 'وجبه', 'غدا', 'عشا', 'فطار', 'حلويات',
    'كريب', 'وافل', 'ايس كريم', 'عصير', 'قهوه', 'كافيه', 'كافي شوب',
  ],
  pharmacy: [
    'صيدليه', 'صيدلي', 'دوا', 'دواء', 'علاج', 'روشته', 'مستشفى', 'دكتور', 'عيان', 'وجعان',
    'حراره', 'سخونه', 'برد', 'كحه', 'مضاد حيوي', 'فيتامين', 'مرهم', 'حبوب', 'شراب',
  ],
  supermarket: [
    'بقاله', 'بقال', 'سوبر ماركت', 'ماركت', 'حاجه من البيت', 'حاجه للبيت', 'بيض', 'لبن',
    'خبز', 'عيش', 'مياه', 'ميه', 'شيبسي', 'سكر', 'رز', 'زيت', 'مكرونه', 'جبنه',
    'تفاح', 'موز', 'طماطم', 'بطاطس', 'بصل', 'خضار', 'فاكهه',
  ],
  delivery_office: [
    'توصيل', 'دليفري', 'طلبيات', 'طلبيه', 'اوردر', 'شيب', 'شحن', 'طرود', 'طرد', 'حاجه توصل',
    'شركه توصيل', 'مندوب',
  ],
}

export const AREA_KEYWORDS: Record<string, string> = {
  'شبين القناطر': 'شبين القناطر',
  'ابو زعبل': 'أبو زعبل',
  'الجبل الاصفر': 'الجبل الأصفر',
  'كفر بطا': 'كفر بطا',
  'منشاه الكرام': 'منشأة الكرام',
  'الخانكه': 'الخانكة',
  'القناطر': 'شبين القناطر',
  'شبين': 'شبين القناطر',
  'قليوب': 'قليوب',
  'بنها': 'بنها',
  'القلج': 'القلج',
  'نوي': 'نوى',
  'طحا': 'طحا',
}

export const OPEN_NOW_WORDS = ['مفتوح دلوقتي', 'فاتح دلوقتي', 'فاتحه دلوقتي', 'شغال دلوقتي', 'مفتوح', 'شغال', 'فاتح', 'فاتحه', 'دلوقتي', 'الان']
export const CLOSED_WORDS = ['مش شغال', 'مقفول', 'قافل']
export const BUDGET_CHEAP = ['علي قد الايد', 'على قد الإيد', 'اقتصادي', 'رخيص', 'معقول']
export const BUDGET_FANCY = ['غالي', 'فخم', 'راقي', 'مميز']

const FOOD_SYNONYMS: Record<string, string[]> = {
  pizza: ['بيتزا'],
  crepe: ['كريب'],
  grill: ['مشويات', 'كباب', 'كفته', 'كفتة', 'شوي'],
  liver: ['كبده', 'كبدة'],
  koshary: ['كشري', 'كشرى'],
  syrian: ['سوري'],
  shawarma: ['شاورما'],
  sandwiches: ['سندوتشات', 'سندوتش', 'ساندوتش'],
  taameya: ['طعميه', 'طعمية', 'فلافل'],
  foul: ['فول'],
  fish: ['اسماك', 'سمك'],
  seafood: ['ماكولات بحريه', 'جمبري', 'بحري'],
  burger: ['برجر', 'برغر'],
  hawawshi: ['حواوشي', 'حواوشى'],
  feteer: ['فطير', 'فطيره'],
  pasta: ['مكرونه', 'باستا'],
  chicken: ['فراخ', 'دجاج'],
  rice: ['ارز', 'رز'],
  molokhia: ['ملوخيه', 'ملوخية'],
  juices: ['عصاير', 'عصائر', 'عصير'],
  desserts: ['حلويات', 'ايس كريم', 'جاتوه', 'كيك'],
  coffee: ['قهوه', 'كافيه', 'نسكافيه'],
  breakfast: ['فطار', 'فطور'],
  eastern: ['شرقي'],
}

const NEAR_WORDS = ['القريبه مني', 'قريبه مني', 'قريب مني', 'القريبه', 'قريبه', 'قريب', 'حواليا', 'حولي', 'جنبي']
const RATING_WORDS = ['الاعلي تقييم', 'اعلي تقييم', 'افضل', 'احسن']
const TRENDING_WORDS = ['الاكثر نشاط', 'ترند', 'مشهور']
const NEW_WORDS = ['الجديد', 'جديد', 'جديده']
const OFFER_WORDS = ['عروض', 'عرض', 'خصم', 'خصومات']
const FILLER_WORDS = new Set([
  'عايز', 'عاوزه', 'عايزة', 'عاوز', 'محتاج', 'محتاجه', 'نفسي', 'نفسى', 'بدور', 'بتدور',
  'دور', 'دورلي', 'هات', 'جيب', 'وريني', 'اعرضلي', 'فين', 'ايه', 'النهارده', 'النهاردة',
  'لو', 'سمحت', 'من', 'مني', 'في', 'علي', 'على', 'حاجه', 'حاجة', 'مكان', 'اماكن', 'أماكن',
])

export type ParsedQuery = {
  raw: string
  normalized: string
  type?: 'restaurant' | 'pharmacy' | 'supermarket' | 'delivery_office'
  area?: string
  food?: string
  openNow?: boolean
  nearMe?: boolean
  sort?: 'rating' | 'views' | 'offers' | 'new'
  budget?: 'cheap' | 'fancy'
  keywords: string[]
  hasIntent: boolean
}

function normalizedPhrases(values: string[]): string[] {
  return [...new Set(values.map(normalizeArabic).filter(Boolean))].sort((a, b) => b.length - a.length)
}

function hasPhrase(text: string, phrase: string): boolean {
  return ` ${text} `.includes(` ${phrase} `)
}

function firstPhrase(text: string, values: string[]): string | undefined {
  for (const value of normalizedPhrases(values)) {
    const variants = value.startsWith('ال') || value.includes(' ')
      ? [value]
      : [value, `ال${value}`]
    const match = variants.find((variant) => hasPhrase(text, variant))
    if (match) return match
  }
  return undefined
}

function consumePhrase(text: string, phrase: string): string {
  let wrapped = ` ${text} `
  const needle = ` ${phrase} `
  while (wrapped.includes(needle)) wrapped = wrapped.replace(needle, ' ')
  return wrapped.replace(/\s+/g, ' ').trim()
}

export function parseArabicQuery(raw: string): ParsedQuery {
  const normalized = normalizeArabic(raw)
  const consumed: string[] = []
  const result: ParsedQuery = {
    raw,
    normalized,
    keywords: [],
    hasIntent: false,
  }

  for (const [type, synonyms] of Object.entries(TYPE_SYNONYMS)) {
    const match = firstPhrase(normalized, synonyms)
    if (match) {
      result.type = type as ParsedQuery['type']
      consumed.push(match)
      break
    }
  }

  for (const [key, area] of Object.entries(AREA_KEYWORDS).sort(([a], [b]) => b.length - a.length)) {
    const phrase = normalizeArabic(key)
    if (hasPhrase(normalized, phrase)) {
      result.area = area
      consumed.push(phrase)
      break
    }
  }

  for (const [food, synonyms] of Object.entries(FOOD_SYNONYMS)) {
    const match = firstPhrase(normalized, synonyms)
    if (match) {
      result.food = food
      result.type ??= 'restaurant'
      consumed.push(match)
      break
    }
  }

  const openPhrase = firstPhrase(normalized, OPEN_NOW_WORDS)
  const closedPhrase = firstPhrase(normalized, CLOSED_WORDS)
  if (openPhrase) {
    result.openNow = true
    consumed.push(openPhrase)
  } else if (closedPhrase) {
    result.openNow = false
    consumed.push(closedPhrase)
  }

  const nearPhrase = firstPhrase(normalized, NEAR_WORDS)
  if (nearPhrase) {
    result.nearMe = true
    consumed.push(nearPhrase)
  }

  const sortGroups: Array<[ParsedQuery['sort'], string[]]> = [
    ['rating', RATING_WORDS],
    ['views', TRENDING_WORDS],
    ['offers', OFFER_WORDS],
    ['new', NEW_WORDS],
  ]
  for (const [sort, phrases] of sortGroups) {
    const match = firstPhrase(normalized, phrases)
    if (match) {
      result.sort = sort
      consumed.push(match)
      break
    }
  }

  const cheapPhrase = firstPhrase(normalized, BUDGET_CHEAP)
  const fancyPhrase = firstPhrase(normalized, BUDGET_FANCY)
  if (cheapPhrase) {
    result.budget = 'cheap'
    consumed.push(cheapPhrase)
  } else if (fancyPhrase) {
    result.budget = 'fancy'
    consumed.push(fancyPhrase)
  }

  let residual = normalized
  for (const phrase of [...new Set(consumed)].sort((a, b) => b.length - a.length)) {
    residual = consumePhrase(residual, phrase)
  }
  result.keywords = residual
    .split(' ')
    .filter(Boolean)
    .filter((word) => !FILLER_WORDS.has(word))

  result.hasIntent = Boolean(
    result.type || result.area || result.food || result.openNow !== undefined ||
    result.nearMe || result.sort || result.budget,
  )
  return result
}

/** One URL builder keeps typed and voice search behavior identical. */
export function buildExploreSearchUrl(raw: string): string {
  const text = raw.trim()
  if (!text) return '/explore'

  const parsed = parseArabicQuery(text)
  const params = new URLSearchParams()
  if (parsed.type) params.set('type', parsed.type)
  if (parsed.food) params.set('food', parsed.food)
  if (parsed.area) params.set('area', parsed.area)
  if (parsed.openNow === true) params.set('open', '1')
  if (parsed.nearMe) params.set('near', '1')
  if (parsed.sort) params.set('sort', parsed.sort)

  const actionableIntent = Boolean(
    parsed.type || parsed.food || parsed.area || parsed.openNow === true || parsed.nearMe || parsed.sort,
  )
  if (parsed.keywords.length > 0) params.set('q', parsed.keywords.join(' '))
  else if (!actionableIntent) params.set('q', text)

  const query = params.toString()
  return query ? `/explore?${query}` : '/explore'
}

export function smartPlaceholder(): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 11) return 'فطار؟ قول مثلاً: فول وطعمية'
  if (hour >= 11 && hour < 15) return 'غدا؟ قول مثلاً: كباب قريب مني'
  if (hour >= 15 && hour < 19) return 'قول: صيدلية فاتحة دلوقتي'
  if (hour >= 19 && hour < 23) return 'عشا؟ قول مثلاً: بيتزا'
  return 'محتاج حاجة؟ اتكلم'
}
