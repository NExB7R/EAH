// ═══════════════════════════════════════════════════════════
// EAH — CSS Modules Purity Check (B10)
// Prevents bare element selectors in *.module.css
// Next.js CSS Modules requires all selectors to be scoped
// ═══════════════════════════════════════════════════════════

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const FORBIDDEN = /^\s*(button|a|input|select|textarea|img|div|span|p|h[1-6]|ul|ol|li|nav|header|footer|main|section|article|aside|form|label|table|tr|td|th|iframe|svg|video|canvas|hr|br)\s*(?:,|:|\{)/m

function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    if (f === 'node_modules' || f === '.next') continue
    const full = join(dir, f)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, out)
    else if (full.endsWith('.module.css')) out.push(full)
  }
  return out
}

const files = walk('web')
const violations = []

for (const f of files) {
  const c = readFileSync(f, 'utf8')
  const lines = c.split('\n')
  let inComment = false
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()
    if (trimmed.startsWith('/*')) inComment = true
    if (inComment) {
      if (trimmed.includes('*/')) inComment = false
      continue
    }
    if (FORBIDDEN.test(line)) {
      violations.push(`${f}:${i + 1}  →  ${trimmed.slice(0, 80)}`)
    }
  }
}

if (violations.length > 0) {
  console.error('❌ CSS Modules purity violated (bare element selector):')
  for (const v of violations.slice(0, 20)) console.error('  ' + v)
  if (violations.length > 20) console.error(`  … +${violations.length - 20} more`)
  console.error('')
  console.error('💡 Fix: move bare selectors to app/globals.css, or scope with a class.')
  console.error('   Example: button { }  →  .myButton { }  OR  move to globals.css')
  process.exit(1)
}

console.log(`✓ CSS Modules purity: ${files.length} files clean`)
