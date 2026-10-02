import fs from 'fs'
import path from 'path'
import { parseChangelog, type Release } from './parser'

export type { Release } from './parser'

// بيقرأ CHANGELOG.md من web/ (Vercel root)
export function getReleases(): Release[] {
  const file = path.join(process.cwd(), 'CHANGELOG.md')
  const md = fs.readFileSync(file, 'utf-8')
  return parseChangelog(md)
}
