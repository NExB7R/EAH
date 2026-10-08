// ═══════════════════════════════════════════════════════════
// EAH — A11y Touch Target Guard
// يمنع رجوع مشكلة Lighthouse "touch targets insufficient"
// المراجع: SESSION_LOG 2026-10-08 · LESSONS §<N>
// القاعدة: أي عنصر تفاعلي في الهيدر لازم ≥ 44px (WCAG 2.2 AAA)
// ═══════════════════════════════════════════════════════════

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it, expect } from 'vitest'

const MIN_TOUCH_TARGET = 44
const CSS_PATH = join(__dirname, '..', 'components', 'floating-capsule.module.css')

function pxValue(body: string, prop: string): number | null {
  const re = new RegExp(`(?:^|;|\\s)${prop}\\s*:\\s*([\\d.]+)px`)
  const m = body.match(re)
  return m ? parseFloat(m[1] ?? '0') : null
}

function blocks(css: string, selector: string): string[] {
  const re = new RegExp(`${selector}\\s*\\{([^}]*)\\}`, 'g')
  const out: string[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(css)) !== null) out.push(m[1] ?? '')
  return out
}

describe('a11y — touch targets (floating-capsule)', () => {
  const css = readFileSync(CSS_PATH, 'utf-8')

  it('.iconBtn — width & height ≥ 44px في كل تعريف', () => {
    const defs = blocks(css, '\\.iconBtn')
    expect(defs.length, 'لازم يكون فيه .iconBtn على الأقل مرة').toBeGreaterThan(0)
    for (const body of defs) {
      const w = pxValue(body, 'width')
      const h = pxValue(body, 'height')
      if (w !== null) expect(w, 'iconBtn width').toBeGreaterThanOrEqual(MIN_TOUCH_TARGET)
      if (h !== null) expect(h, 'iconBtn height').toBeGreaterThanOrEqual(MIN_TOUCH_TARGET)
    }
  })

  it('.loginBtn — height أو min-height ≥ 44px في كل تعريف', () => {
    const defs = blocks(css, '\\.loginBtn')
    expect(defs.length, 'لازم يكون فيه .loginBtn على الأقل مرة').toBeGreaterThan(0)
    for (const body of defs) {
      const h = pxValue(body, 'height')
      const mh = pxValue(body, 'min-height')
      const size = h ?? mh
      if (size !== null)
        expect(size, 'loginBtn height/min-height').toBeGreaterThanOrEqual(MIN_TOUCH_TARGET)
    }
  })

  it('mobile gap بين الأزرار ≥ 8px (WCAG 2.2 spacing)', () => {
    // ابحث عن .right / .left داخل media query الموبايل
    const mobileBlock = css.match(/@media[^{]*max-width:\s*640px[^{]*\{([\s\S]*?)\n\}/)
    expect(mobileBlock, 'لازم يكون فيه mobile media query').toBeTruthy()
    const body = mobileBlock?.[1] ?? ''
    const gapMatch = body.match(/\.right[\s\S]*?\.left[\s\S]*?gap:\s*([\d.]+)px/)
    const gap = gapMatch ? parseFloat(gapMatch[1] ?? '0') : null
    expect(gap, 'mobile .right/.left gap').toBeGreaterThanOrEqual(8)
  })
})
