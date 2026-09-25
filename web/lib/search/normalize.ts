// ═══════════════════════════════════════════════════════════
// EAH — Text Normalization (Arabic + Egyptian)
// ═══════════════════════════════════════════════════════════

// إزالة التشكيل (fatha, damma, kasra, shadda, sukun, tanwin)
const TASHKEEL = /[\u064B-\u065F\u0670]/g

// الألف بكل أشكالها
const ALEF_VARIANTS = /[أإآٱ]/g

// الياء بكل أشكالها
const YAA_VARIANTS = /[ىئ]/g

// التاء المربوطة
const TAA_MARBUTA = /ة/g

// المسافات المتكررة
const MULTI_SPACE = /\s+/g

export function normalizeArabic(input: string): string {
  if (!input) return ''

  return input
    .normalize('NFKD') // Unicode normalize
    .replace(TASHKEEL, '')
    .replace(ALEF_VARIANTS, 'ا')
    .replace(YAA_VARIANTS, 'ي')
    .replace(TAA_MARBUTA, 'ه')
    .toLowerCase()
    .trim()
    .replace(MULTI_SPACE, ' ')
}
