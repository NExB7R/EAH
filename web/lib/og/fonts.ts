import 'server-only'

// ═══════════════════════════════════════════════════════════
// EAH — OG Fonts (Noto Sans Arabic TTF)
// ═══════════════════════════════════════════════════════════

const NOTO_ARABIC_REGULAR =
  'https://github.com/google/fonts/raw/main/ofl/notosansarabic/NotoSansArabic%5Bwdth%2Cwght%5D.ttf'

let cachedFont: ArrayBuffer | null = null
let cachedFontBold: ArrayBuffer | null = null

async function fetchFont(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Font fetch failed: ${res.status}`)
  return res.arrayBuffer()
}

export async function getOgFonts() {
  if (!cachedFont) {
    cachedFont = await fetchFont(NOTO_ARABIC_REGULAR)
    cachedFontBold = cachedFont
  }
  return [
    { name: 'Noto', data: cachedFont, weight: 400 as const, style: 'normal' as const },
    { name: 'Noto', data: cachedFontBold!, weight: 700 as const, style: 'normal' as const },
  ]
}
