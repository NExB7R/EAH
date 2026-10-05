// ═══════════════════════════════════════════════════════════
// EAH — Text Normalization (Arabic + Egyptian)
//   • إزالة التشكيل
//   • توحيد الألف/الياء/التاء
//   • أرقام عربية → إنجليزية
//   • رموز زايدة → مسافة
// ═══════════════════════════════════════════════════════════

// التشكيل (fatha, damma, kasra, shadda, sukun, tanwin)
const TASHKEEL = /[\u064B-\u065F\u0670]/g

// الألف بكل أشكالها
const ALEF_VARIANTS = /[أإآٱ]/g

// الياء بكل أشكالها
const YAA_VARIANTS = /[ىئ]/g

// التاء المربوطة
const TAA_MARBUTA = /ة/g

// الهمزة
const HAMZA = /[ؤء]/g

// الأرقام العربية (٠-٩) + الفارسية (۰-۹)
const ARABIC_DIGITS = /[٠-٩۰-۹]/g

// المسافات المتكررة
const MULTI_SPACE = /\s+/g

// رموز مش مفيدة
const NOISE_CHARS = /[.,،؛;:!?؟\-_()[\]{}"'«»]/g

const DIGIT_MAP: Record<string, string> = {
  '٠': '0',
  '١': '1',
  '٢': '2',
  '٣': '3',
  '٤': '4',
  '٥': '5',
  '٦': '6',
  '٧': '7',
  '٨': '8',
  '٩': '9',
  '۰': '0',
  '۱': '1',
  '۲': '2',
  '۳': '3',
  '۴': '4',
  '۵': '5',
  '۶': '6',
  '۷': '7',
  '۸': '8',
  '۹': '9',
}

function convertDigits(input: string): string {
  return input.replace(ARABIC_DIGITS, (d) => DIGIT_MAP[d] ?? d)
}

export function normalizeArabic(input: string): string {
  if (!input) return ''

  return convertDigits(input)
    .normalize('NFKD')
    .replace(TASHKEEL, '')
    .replace(ALEF_VARIANTS, 'ا')
    .replace(YAA_VARIANTS, 'ي')
    .replace(TAA_MARBUTA, 'ه')
    .replace(HAMZA, 'ء')
    .replace(NOISE_CHARS, ' ')
    .toLowerCase()
    .trim()
    .replace(MULTI_SPACE, ' ')
}

// تقسيم لكلمات
export function tokenize(input: string): string[] {
  const normalized = normalizeArabic(input)
  if (!normalized) return []
  return normalized.split(' ').filter((w) => w.length > 1)
}

// cache
const cache = new Map<string, string>()

export function cachedNormalize(input: string): string {
  if (!input) return ''
  const hit = cache.get(input)
  if (hit !== undefined) return hit
  const result = normalizeArabic(input)
  if (cache.size > 2000) cache.clear()
  cache.set(input, result)
  return result
}
