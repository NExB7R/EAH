// ═══════════════════════════════════════════════════════════
// EAH — CHANGELOG Parser
// يحول CHANGELOG.md لبيانات منظمة للـ /updates page
// ═══════════════════════════════════════════════════════════

export type EntryType =
  'added' | 'changed' | 'fixed' | 'removed' | 'security' | 'perf' | 'docs' | 'planned'

export type Entry = {
  type: EntryType
  text: string
}

export type Release = {
  version: string
  date: string | null
  isCurrent: boolean
  isPlanned: boolean
  isPreRelease: boolean
  entries: Entry[]
}

const SECTION_MAP: Record<string, EntryType> = {
  added: 'added',
  changed: 'changed',
  fixed: 'fixed',
  removed: 'removed',
  security: 'security',
  perf: 'perf',
  performance: 'perf',
  docs: 'docs',
  planned: 'planned',
}

export function parseChangelog(md: string): Release[] {
  const releases: Release[] = []
  const lines = md.split('\n')

  let current: Release | null = null
  let currentType: EntryType | null = null

  for (const raw of lines) {
    const line = raw.trimEnd()

    // ## [v1.0.0] — title (date)
    const vHead = line.match(/^##\s+\[([^\]]+)\](.*)$/)
    if (vHead) {
      const version = (vHead[1] ?? '').trim()
      const tail = vHead[2] ?? ''

      if (current) releases.push(current)

      // تخطي الـ markers (زي Pre-release History)
      if (version.toLowerCase() === 'pre-release history') {
        current = null
        currentType = null
        continue
      }

      const dateMatch = tail.match(/(\d{4}-\d{2}-\d{2})/)

      current = {
        version,
        date: dateMatch ? (dateMatch[1] ?? null) : null,
        isCurrent: /^v1\.0\.0$/.test(version),
        isPlanned: !dateMatch,
        isPreRelease: /-(alpha|beta|rc)/i.test(version),
        entries: [],
      }
      currentType = null
      continue
    }

    // ### Added
    const sHead = line.match(/^###\s+(.+)$/)
    if (sHead && current) {
      const key = (sHead[1] ?? '').trim().toLowerCase()
      currentType = SECTION_MAP[key] ?? 'changed'
      continue
    }

    // - item
    const li = line.match(/^-\s+(.+)$/)
    if (li && current && currentType) {
      const text = (li[1] ?? '').trim()
      if (text) current.entries.push({ type: currentType, text })
      continue
    }
  }

  if (current) releases.push(current)
  return releases
}
