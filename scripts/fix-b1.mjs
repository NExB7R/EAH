#!/usr/bin/env node
/**
 * EAH - B1 Auto-Fixer (AP-06) — v2
 * ==================================
 * Fixes: `.eq('owner_profile_id', X)` chain that ends in `.maybeSingle()`
 *        WITHOUT a `.limit(1)` guard.
 *
 * v2 changes (2026-10-20):
 *   - Two-step match (no regex backtracking) — no more double .limit(1).
 *   - Chain-break guard: skips patterns broken by `,`/`;` at depth 0.
 *   - Idempotent: skips if `.limit(` already present.
 *   - Dry-run by default.
 *
 * Usage:
 *   node scripts/fix-b1.mjs              # preview
 *   node scripts/fix-b1.mjs --apply      # write
 *   node scripts/fix-b1.mjs --verbose    # per-change log
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT    = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const WEB     = join(ROOT, 'web');
const APPLY   = process.argv.includes('--apply');
const VERBOSE = process.argv.includes('--verbose');

const IGNORE_DIRS = new Set([
  'node_modules', '.next', 'dist', 'build', '.turbo',
  'coverage', '.git', '.vercel', '.swc', 'out',
]);
const SCAN_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);

async function* walk(dir) {
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    if (IGNORE_DIRS.has(e.name)) continue;
    if (e.name.startsWith('.') && e.isDirectory()) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (e.isFile() && SCAN_EXTS.has(extname(e.name))) yield full;
  }
}

/**
 * Finds chain: .eq('owner_profile_id', X) [.method(args)]* .maybeSingle(
 * Returns list of { eqEnd, mbStart, middle } for chains WITHOUT .limit().
 */
function findViolations(content) {
  const out = [];
  const eqRe = /\.eq\(\s*['"]owner_profile_id['"][^)]*\)(?=\s*\.)/g;
  let m;
  while ((m = eqRe.exec(content)) !== null) {
    const eqEnd = m.index + m[0].length;
    const window = content.slice(eqEnd, eqEnd + 500);
    const mbIdx = window.search(/\.maybeSingle\s*\(/);
    if (mbIdx === -1) {
      if (m.index === eqRe.lastIndex) eqRe.lastIndex++;
      continue;
    }
    const middle = window.slice(0, mbIdx);
    const stripped = middle.replace(/\([^)]*\)/g, '');
    const hasBreak = /[,;]/.test(stripped);
    const hasLimit = /\.limit\s*\(/.test(middle);
    if (!hasBreak && !hasLimit) {
      out.push({ eqEnd, mbStart: eqEnd + mbIdx, middle });
    }
    if (m.index === eqRe.lastIndex) eqRe.lastIndex++;
  }
  return out;
}

let totalFixes = 0;
let filesChanged = 0;

for await (const file of walk(WEB)) {
  let content;
  try { content = await readFile(file, 'utf8'); } catch { continue; }

  const violations = findViolations(content);
  if (violations.length === 0) continue;

  let out = content;
  // Apply right-to-left to preserve indices
  for (let i = violations.length - 1; i >= 0; i--) {
    const v = violations[i];
    const ws = v.middle.match(/\s*$/)?.[0] ?? '';
    const prefix = v.middle.slice(0, v.middle.length - ws.length);
    const insert = prefix + '.limit(1)' + ws;
    out = out.slice(0, v.eqEnd) + insert + out.slice(v.mbStart);

    if (VERBOSE) {
      const lineNo = content.slice(0, v.eqEnd).split('\n').length;
      console.log(`  ${relative(ROOT, file)}:${lineNo}  +.limit(1)`);
    }
  }

  if (violations.length > 0) {
    filesChanged++;
    totalFixes += violations.length;
    if (APPLY) await writeFile(file, out, 'utf8');
  }
}

console.log('');
console.log(`${APPLY ? 'APPLIED' : 'DRY RUN'} — ${totalFixes} fixes in ${filesChanged} files`);
if (!APPLY && totalFixes > 0) {
  console.log('');
  console.log('Run with --apply to write changes.');
  console.log('Then verify: node scripts/verify-invariants.mjs');
}
