// ─── Arabic text normalization ───
export function normalizeArabic(raw: string): string {
  return raw
    .replace(/[\u064B-\u065F\u0670]/g, '')      // diacritics
    .replace(/\u0640/g, '')                     // tatweel
    .replace(/[أإآٱ]/g, 'ا')                    // alef forms
    .replace(/ى/g, 'ي')                         // alef maqsura
    .replace(/ة/g, 'ه')                         // ta marbuta
    .replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')      // hamza forms
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')          // punctuation → space
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

// ─── Egyptian synonym map ───
export const TYPE_SYNONYMS: Record<string, string[]> = {
  restaurant: [
    'مطعم','مطاعم','اكل','آكل','ماكل','جعان','جعانه','نفسي في حاجه','نفسي في حاجة',
    'كباب','كفته','مشويات','فراخ','لحمه','بيتزا','برجر','ساندوتش','سندوتش','شاورما',
    'فول','طعميه','فلافل','كشري','مكرونه','سمك','وجبه','غدا','عشا','فطار','حلويات',
    'كريب','وافل','ايس كريم','عصير','قهوه','كافيه','كافي شوب',
  ],
  pharmacy: [
    'صيدليه','صيدلي','دوا','دواء','علاج','روشته','مستشفى','دكتور','عيان','وجعان',
    'حراره','سخونه','برد','كحه','مضاد حيوي','فيتامين','مرهم','حبوب','شراب',
  ],
  supermarket: [
    'بقاله','بقال','سوبر ماركت','ماركت','حاجه من البيت','حاجه للبيت','بيض','لبن',
    'خبز','عيش','مياه','ميه','شيبسي','سكر','رز','زيت','مكرونه','جبنه','لحمه مفرومه',
    'تفاح','موز','طماطم','بطاطس','بصل','خضار','فاكهه',
  ],
  delivery_office: [
    'توصيل','دليفري','طلبيات','طلبية','اوردر','شيب','شحن','طرود','طرد','حاجه توصل',
    'شركه توصيل','مندوب',
  ],
}

export const AREA_KEYWORDS: Record<string, string> = {
  'شبين': 'شبين القناطر',
  'القناطر': 'شبين القناطر',
  'شبين القناطر': 'شبين القناطر',
  'ابو زعبل': 'أبو زعبل',
  'الخانكه': 'الخانكة',
  'قليوب': 'قليوب',
  'بنها': 'بنها',
}

export const OPEN_NOW_WORDS = ['مفتوح','شغال','فاتح','دلوقتي','الان','الآن','بيشتغل']
export const CLOSED_WORDS = ['مقفول','قافل','مش شغال']
export const BUDGET_CHEAP = ['رخيص','علي قد الايد','على قد الإيد','اقتصادي','معقول']
export const BUDGET_FANCY = ['غالي','فخم','راقي','مميز']

// ─── Parsed query ───
export type ParsedQuery = {
  raw: string
  normalized: string
  type?: string
  area?: string
  openNow?: boolean
  budget?: 'cheap' | 'fancy'
  keywords: string[]     // باقي الكلمات الدالة
  hasIntent: boolean
}

// ─── Parse Arabic query ───
export function parseArabicQuery(raw: string): ParsedQuery {
  const normalized = normalizeArabic(raw)
  const words = normalized.split(' ').filter(Boolean)

  const result: ParsedQuery = {
    raw,
    normalized,
    keywords: words,
    hasIntent: false,
  }

  // type detection
  for (const [type, syns] of Object.entries(TYPE_SYNONYMS)) {
    for (const s of syns) {
      if (normalized.includes(normalizeArabic(s))) {
        result.type = type
        result.hasIntent = true
        break
      }
    }
    if (result.type) break
  }

  // area detection
  for (const [key, area] of Object.entries(AREA_KEYWORDS)) {
    if (normalized.includes(normalizeArabic(key))) {
      result.area = area
      result.hasIntent = true
      break
    }
  }

  // open now
  if (OPEN_NOW_WORDS.some((w) => normalized.includes(normalizeArabic(w)))) {
    result.openNow = true
    result.hasIntent = true
  }
  if (CLOSED_WORDS.some((w) => normalized.includes(normalizeArabic(w)))) {
    result.openNow = false
    result.hasIntent = true
  }

  // budget
  if (BUDGET_CHEAP.some((w) => normalized.includes(normalizeArabic(w)))) {
    result.budget = 'cheap'
    result.hasIntent = true
  }
  if (BUDGET_FANCY.some((w) => normalized.includes(normalizeArabic(w)))) {
    result.budget = 'fancy'
    result.hasIntent = true
  }

  return result
}

// ─── Suggest placeholder text based on time ───
export function smartPlaceholder(): string {
  const h = new Date().getHours()
  if (h >= 5 && h < 11) return 'فطار؟ قول مثلاً: فول وطعمية'
  if (h >= 11 && h < 15) return 'غدا؟ قول مثلاً: كباب قريب مني'
  if (h >= 15 && h < 19) return 'قول: صيدلية فاتحة دلوقتي'
  if (h >= 19 && h < 23) return 'عشا؟ قول مثلاً: بيتزا'
  return 'محتاج حاجة؟ اتكلم'
}
