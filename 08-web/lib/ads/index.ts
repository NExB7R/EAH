import { createPublicClient } from '@/lib/supabase-server'
import type { Ad, AdSlot, AdSlotType } from './types'

export async function getActiveAdForSlot(slotCode: AdSlotType): Promise<Ad | null> {
  try {
    const supabase = createPublicClient()
    const now = new Date().toISOString()
    const { data } = await supabase
      .from('ads')
      .select('*, slot:ad_slots!inner(code)')
      .eq('slot.code', slotCode)
      .eq('status', 'active')
      .lte('starts_at', now)
      .or(`ends_at.is.null,ends_at.gt.${now}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    return (data as Ad | null) ?? null
  } catch {
    return null
  }
}

export async function getAllAdSlots(): Promise<AdSlot[]> {
  try {
    const supabase = createPublicClient()
    const { data } = await supabase
      .from('ad_slots')
      .select('*')
      .eq('is_active', true)
      .order('display_order')
    return (data ?? []) as AdSlot[]
  } catch {
    return []
  }
}

export function getAdHref(ad: Ad, slugMap?: Map<string, string>): string {
  if (ad.link_type === 'external' && ad.link_url) return ad.link_url
  if (ad.link_type === 'internal' && ad.link_url) return ad.link_url
  if (ad.link_type === 'business' && ad.target_business_id && slugMap) {
    const slug = slugMap.get(ad.target_business_id)
    if (slug) return `/businesses/${slug}`
  }
  return ad.link_url ?? '#'
}
