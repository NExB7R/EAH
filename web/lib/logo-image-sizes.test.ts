// ═══════════════════════════════════════════════════════════
// EAH — Logo Image Sizes Guard
// يمنع رجوع مشكلة Lighthouse "image larger than displayed"
// المراجع: SESSION_LOG 2026-10-08 · PageSpeed 2026-10-08
// القاعدة: أي next/image من /eah-crown.webp → لازم sizes
// ═══════════════════════════════════════════════════════════

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it, expect } from 'vitest'

const LOGO_PATH = join(__dirname, '..', 'components', 'logo.tsx')

describe('a11y/perf — logo crown image sizes', () => {
  const src = readFileSync(LOGO_PATH, 'utf-8')

  it('crown image (eah-crown.webp) له sizes prop', () => {
    // ابحث عن كل <Image ... src="/eah-crown.webp" ...>
    const re = /<Image[\s\S]*?src="\/eah-crown\.webp"[\s\S]*?\/>/g
    const matches = src.match(re) ?? []
    expect(matches.length, 'لازم يكون فيه Image للتاج').toBeGreaterThan(0)
    for (const block of matches) {
      expect(block, 'crown Image لازم يكون فيه sizes').toMatch(/sizes="[^"]+"/)
    }
  })
})
