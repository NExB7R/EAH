/**
 * EAH Real Stats Loader
 * ---------------------
 * يقرا view stats حقيقية من Supabase RPC get_business_view_stats
 * لو فشل → بيرجع Map فاضية → mock-stats بياخد الـ default
 */

import { createClient } from './supabase-server'

export type ViewStat = {
  slug: string
  views: number
  unique_visitors: number
}

const MAX_SLUGS = 200
const DEFAULT_DAYS = 7

export async function getViewStats(
  slugs: string[],
  days: number = DEFAULT_DAYS
): Promise<Map<string, ViewStat>> {
  const map = new Map<string, ViewStat>()
  if (slugs.length === 0) return map

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_business_view_stats', {
      p_slugs: slugs.slice(0, MAX_SLUGS),
      p_days: days,
    })
    if (error || !data) return map

    for (const row of data as ViewStat[]) {
      map.set(row.slug, {
        slug: row.slug,
        views: Number(row.views) || 0,
        unique_visitors: Number(row.unique_visitors) || 0,
      })
    }
  } catch {
    // silent fallback — mock stats will be used
  }
  return map
}
