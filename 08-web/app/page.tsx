import { promises as fs } from 'node:fs'
import path from 'node:path'
import EahHomeClient from '@/components/eah-home-client'
import { defaultEahPageData } from '@/components/eah-default-design'
import type { EahPageData } from '@/components/eah-page-builder-pro2'
import { getPublishedBusinesses } from '@/lib/data'

async function loadDesign(): Promise<EahPageData> {
  try {
    const raw = await fs.readFile(path.join(process.cwd(), '.eah', 'studio.json'), 'utf8')
    return JSON.parse(raw) as EahPageData
  } catch {
    return defaultEahPageData
  }
}

export default async function Page() {
  const [businesses, data] = await Promise.all([getPublishedBusinesses(8), loadDesign()])
  return <EahHomeClient businesses={businesses} data={data} />
}
