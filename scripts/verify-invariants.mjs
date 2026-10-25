#!/usr/bin/env node
/**
 * EAH - Invariants Verifier (v2)
 * ================================
 * Enforces AI_PLAYBOOK §4 + ERROR_REGISTER §6 baselines (B1-B9).
 * Absolute bans X1-X4 are warn-only by default, fail with --strict.
 *
 * v2 changes (2026-10-20):
 *   - B1 regex fixed: excludes `.limit(1).maybeSingle()` (already-fixed pattern).
 *   - B6 regex scoped: SACRED §1.4 bans backdrop-filter on CARDS only;
 *     modals/drawers/palettes are legitimate. Explicit allowlist below.
 *   - Baselines updated to reflect accurate counts (B1=0 after fixer, B6=35).
 *
 * Usage:
 *   node scripts/verify-invariants.mjs               # default
 *   node scripts/verify-invariants.mjs --strict      # CI gate
 *   node scripts/verify-invariants.mjs --json        # machine-readable
 *   node scripts/verify-invariants.mjs --verbose     # show all findings
 *
 * Exit codes: 0 OK | 1 gate failed | 2 script error
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, extname, sep, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const WEB  = join(ROOT, 'web');

const ARGS     = new Set(process.argv.slice(2));
const STRICT   = ARGS.has('--strict');
const JSON_OUT = ARGS.has('--json');
const VERBOSE  = ARGS.has('--verbose');

const IGNORE_DIRS = new Set([
  'node_modules', '.next', 'dist', 'build', '.turbo',
  'coverage', '.git', '.vercel', '.swc', 'out',
]);

const SCAN_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.css']);

const isTest        = (p) => /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(p) || p.includes(`${sep}scripts${sep}`) || p.includes(`${sep}__tests__${sep}`);
const isDeclaration = (p) => p.endsWith('.d.ts');
const isCss         = (p) => p.endsWith('.css');
const isJsx         = (p) => p.endsWith('.tsx') || p.endsWith('.jsx');

// Modal/drawer/overlay file allowlist for B6 (SACRED ban is cards-only).
const MODAL_OR_OVERLAY = new Set([
  'menu-drawer.module.css',
  'menu-slider.module.css',
  'order-modal.module.css',
  'smart-lock-modal.module.css',
  'command-palette.module.css',
  'confirm-modal.module.css',
]);
const isModalOrOverlay = (p) => MODAL_OR_OVERLAY.has(basename(p));

// ── Baselines (ERROR_REGISTER §6 — source of truth, keep in sync) ─
const BASELINE = Object.freeze({
  'B1:owner-maybeSingle':   0,  // cleared via scripts/fix-b1.mjs (2026-10-20)
  'B2:select-star':        62,
  'B3:raw-img': 10,
  'B4:anim-infinite':      16,
  'B5:forbidden-color':    47,
  'B6:backdrop-filter':    35,  // v2: modals/drawers excluded (43-8)
  'B7:hardcoded-domain':    8,
  'B8:eslint-disable': 22,
  'B9:emoji-ui':          146,
});

const ABSOLUTE_BANS = new Set([
  'X1:console-log',
  'X2:any',
  'X3:ts-ignore',
  'X4:service-role-client',
]);

// ── File walker ──────────────────────────────────────────────
async function* walk(dir) {
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); }
  catch { return; }
  for (const e of entries) {
    if (IGNORE_DIRS.has(e.name)) continue;
    if (e.name.startsWith('.') && e.isDirectory()) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (e.isFile() && SCAN_EXTS.has(extname(e.name))) yield full;
  }
}

// ── Helpers ──────────────────────────────────────────────────
function countMatches(content, source, flags) {
  const re = new RegExp(source, flags.includes('g') ? flags : flags + 'g');
  const out = [];
  let m;
  while ((m = re.exec(content)) !== null) {
    out.push({ index: m.index, text: m[0] });
    if (m.index === re.lastIndex) re.lastIndex++;
  }
  return out;
}

function lineAt(content, index) {
  let line = 1;
  for (let i = 0; i < index && i < content.length; i++) {
    if (content[i] === '\n') line++;
  }
  return line;
}

// ── Checks ───────────────────────────────────────────────────
const CHECKS = [
  {
    id: 'B1:owner-maybeSingle',
    // Excludes `.limit(...)` between `.eq('owner_profile_id'` and `.maybeSingle(`
    // — that pattern is already AP-06 compliant.
    apply(c, f) {
      if (isCss(f) || isTest(f) || isDeclaration(f)) return [];
      const eqRe = /\.eq\(\s*['"]owner_profile_id['"][^)]*\)(?=\s*\.)/g;
      const out = [];
      let m;
      while ((m = eqRe.exec(c)) !== null) {
        const after = c.slice(m.index + m[0].length, m.index + m[0].length + 500);
        const mbIdx = after.search(/\.maybeSingle\s*\(/);
        if (mbIdx !== -1) {
          const middle = after.slice(0, mbIdx);
          const stripped = middle.replace(/\([^)]*\)/g, '');
          const hasBreak = /[,;]/.test(stripped);
          const hasLimit = /\.limit\s*\(/.test(middle);
          if (!hasBreak && !hasLimit) {
            out.push({ line: lineAt(c, m.index), snippet: (m[0] + middle.slice(0, 40) + '.maybeSingle(').slice(0, 100) });
          }
        }
        if (m.index === eqRe.lastIndex) eqRe.lastIndex++;
      }
      return out;
    },
  },
  {
    id: 'B2:select-star',
    apply(c, f) {
      if (isCss(f) || isTest(f) || isDeclaration(f)) return [];
      return countMatches(c, String.raw`\.select\(\s*['"]\*['"]\s*\)`, 'g')
        .map(m => ({ line: lineAt(c, m.index), snippet: m.text.slice(0, 80) }));
    },
  },
  {
    id: 'B3:raw-img',
    apply(c, f) {
      if (!isJsx(f) || isTest(f) || isDeclaration(f)) return [];
      return countMatches(c, String.raw`<img\b`, 'g')
        .map(m => ({ line: lineAt(c, m.index), snippet: m.text.slice(0, 60) }));
    },
  },
  {
    id: 'B4:anim-infinite',
    apply(c, f) {
      if (!isCss(f)) return [];
      return countMatches(c, String.raw`animation[^;{}]*\binfinite\b`, 'g')
        .map(m => ({ line: lineAt(c, m.index), snippet: m.text.slice(0, 80) }));
    },
  },
  {
    id: 'B5:forbidden-color',
    apply(c, f) {
      if (!isCss(f)) return [];
      return countMatches(c, String.raw`#(?:fff|ffffff|000|000000)\b`, 'gi')
        .map(m => ({ line: lineAt(c, m.index), snippet: m.text.slice(0, 40) }));
    },
  },
  {
    id: 'B6:backdrop-filter',
    // SACRED §1.4 bans backdrop-filter on CARDS. Modals/drawers/palettes
    // legitimately use it for dimming. Skip allowlisted files.
    apply(c, f) {
      if (!isCss(f) || isModalOrOverlay(f)) return [];
      return countMatches(c, String.raw`backdrop-filter\s*:`, 'g')
        .map(m => ({ line: lineAt(c, m.index), snippet: m.text.slice(0, 60) }));
    },
  },
  {
    id: 'B7:hardcoded-domain',
    apply(c, f) {
      if (isCss(f) || isTest(f) || isDeclaration(f)) return [];
      return countMatches(c, String.raw`(?:eah-sq\.vercel\.app|eah\.app)`, 'g')
        .map(m => ({ line: lineAt(c, m.index), snippet: m.text.slice(0, 60) }));
    },
  },
  {
    id: 'B8:eslint-disable',
    apply(c, f) {
      if (isTest(f) || isDeclaration(f)) return [];
      return countMatches(c, String.raw`eslint-disable`, 'g')
        .map(m => ({ line: lineAt(c, m.index), snippet: m.text.slice(0, 80) }));
    },
  },
  {
    id: 'B9:emoji-ui',
    apply(c, f) {
      if (!isJsx(f) || isTest(f) || isDeclaration(f)) return [];
      return countMatches(c, String.raw`[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}]`, 'gu')
        .map(m => ({ line: lineAt(c, m.index), snippet: m.text }));
    },
  },
  {
    id: 'X1:console-log',
    apply(c, f) {
      if (isCss(f) || isTest(f) || isDeclaration(f)) return [];
      return countMatches(c, String.raw`console\.log\s*\(`, 'g')
        .map(m => ({ line: lineAt(c, m.index), snippet: m.text.slice(0, 60) }));
    },
  },
  {
    id: 'X2:any',
    apply(c, f) {
      if (isCss(f) || isTest(f) || isDeclaration(f)) return [];
      return countMatches(c, String.raw`:\s*any\b|as\s+any\b|<any>`, 'g')
        .map(m => ({ line: lineAt(c, m.index), snippet: m.text.slice(0, 60) }));
    },
  },
  {
    id: 'X3:ts-ignore',
    apply(c, f) {
      if (isCss(f) || isTest(f) || isDeclaration(f)) return [];
      return countMatches(c, String.raw`@ts-ignore`, 'g')
        .map(m => ({ line: lineAt(c, m.index), snippet: m.text.slice(0, 80) }));
    },
  },
  {
    id: 'X4:service-role-client',
    apply(c, f) {
      if (isCss(f) || isTest(f) || isDeclaration(f)) return [];
      const hasClient = /^(?:'use client'|"use client")\s*;?/m.test(c);
      if (!hasClient) return [];
      return countMatches(c, String.raw`(?:SUPABASE_SERVICE_ROLE_KEY|service_role)`, 'g')
        .map(m => ({ line: lineAt(c, m.index), snippet: m.text.slice(0, 60) }));
    },
  },
];

// ── Main ─────────────────────────────────────────────────────
async function pathExists(p) {
  try { await stat(p); return true; } catch { return false; }
}

const pad      = (s, n) => String(s).padEnd(n);
const truncate = (s, n) => s.length > n ? s.slice(0, n - 1) + '…' : s;

async function main() {
  if (!(await pathExists(WEB))) {
    console.error('[verify-invariants] web/ not found at ' + WEB);
    process.exit(2);
  }

  const buckets = new Map(CHECKS.map(c => [c.id, { check: c, findings: [] }]));

  for await (const file of walk(WEB)) {
    let content;
    try { content = await readFile(file, 'utf8'); }
    catch { continue; }
    const rel = relative(ROOT, file).split(sep).join('/');
    for (const c of CHECKS) {
      for (const f of c.apply(content, file)) {
        buckets.get(c.id).findings.push({ file: rel, ...f });
      }
    }
  }

  const rows = [];
  let failed = false;

  for (const c of CHECKS) {
    const r = buckets.get(c.id);
    const count = r.findings.length;
    let baseline, status;

    if (ABSOLUTE_BANS.has(c.id)) {
      baseline = 0;
      if (count === 0)      status = 'OK';
      else if (STRICT)    { status = 'FAIL'; failed = true; }
      else                  status = 'WARN';
    } else {
      baseline = BASELINE[c.id];
      if (count > baseline) { status = 'FAIL'; failed = true; }
      else if (count < baseline) status = 'OK-';
      else status = 'OK';
    }

    rows.push({ id: c.id, baseline, count, status, findings: r.findings, absolute: ABSOLUTE_BANS.has(c.id) });
  }

  if (JSON_OUT) {
    process.stdout.write(JSON.stringify({ ok: !failed, strict: STRICT, rows }, null, 2) + '\n');
    process.exit(failed ? 1 : 0);
  }

  console.log('');
  console.log('EAH - Invariants Verifier' + (STRICT ? ' [strict]' : ''));
  console.log('Root: ' + WEB);
  console.log('─'.repeat(76));
  console.log(pad('ID', 26) + pad('Baseline', 10) + pad('Count', 8) + 'Status');
  console.log('─'.repeat(76));
  for (const row of rows) {
    const bl = row.absolute ? (STRICT ? '0' : '0*') : String(row.baseline);
    console.log(pad(row.id, 26) + pad(bl, 10) + pad(String(row.count), 8) + row.status);
  }
  console.log('─'.repeat(76));

  const showDetails = VERBOSE || failed;
  if (showDetails) {
    for (const row of rows) {
      if (row.findings.length === 0) continue;
      if (!VERBOSE && row.status !== 'FAIL' && !(STRICT && row.absolute)) continue;
      console.log('');
      console.log(row.id + ' - ' + row.findings.length + ' finding(s):');
      const limit = VERBOSE ? row.findings.length : 20;
      for (const f of row.findings.slice(0, limit)) {
        console.log('  ' + f.file + ':' + f.line + '  ' + truncate(f.snippet, 70));
      }
      if (!VERBOSE && row.findings.length > 20) {
        console.log('  … and ' + (row.findings.length - 20) + ' more (use --verbose)');
      }
    }
  }

  console.log('');
  console.log(failed ? 'FAILED - baseline exceeded' : 'OK');
  process.exit(failed ? 1 : 0);
}

main().catch(err => {
  console.error('[verify-invariants] unexpected error:', err);
  process.exit(2);
});
