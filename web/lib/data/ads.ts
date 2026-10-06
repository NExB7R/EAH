import { unstable_cache } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'
import { createClient } from '@/lib/supabase/server'

// ═══════════════════════════════════════════════════════════
// EAH — Ads Data
// ═══════════════════════════════════════════════════════════

export type AdSlotCode = 'home_banner' | 'home_feed' | 'category_banner' | 'trend_pin'

export type ActiveAd = {
  id: string
  title: string
  image_url: string | null
  link_url: string | null
  business: {
    slug: string
    name: string
  } | null
}

export type MerchantAd = {
  id: string
  slot_id: string
  slot_name: string
  slot_code: string
  title: string
  image_url: string | null
  link_url: string | null
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'expired' | 'paused'
  starts_at: string | null
  ends_at: string | null
  impressions: number
  clicks: number
  rejected_reason: string | null
  created_at: string
}

export type AdminAd = MerchantAd & {
  business_name: string
  business_slug: string
  business_id: string
}

// ─── Public: إعلانات نشطة لـ slot معين ───

export const getActiveAdsForSlot = unstable_cache(
  async (slotCode: AdSlotCode, limit = 3): Promise<ActiveAd[]> => {
    const supabase = createPublicClient()

    const { data: slot } = await supabase
      .from('ad_slots')
      .select('id')
      .eq('code', slotCode)
      .eq('is_active', true)
      .maybeSingle()

    if (!slot) return []

    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('ads')
      .select(
        `
        id, title, image_url, link_url,
        business:businesses(slug, name)
      `,
      )
      .eq('slot_id', slot.id)
      .eq('status', 'active')
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`ends_at.is.null,ends_at.gt.${now}`)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[data] getActiveAdsForSlot error:', error.message)
      return []
    }

    return (data ?? []).map((r) => {
      const biz = r.business as unknown as
        { slug: string; name: string }[] | { slug: string; name: string } | null
      const single = Array.isArray(biz) ? (biz[0] ?? null) : biz
      return {
        id: r.id,
        title: r.title,
        image_url: r.image_url,
        link_url: r.link_url,
        business: single,
      }
    })
  },
  ['ads-active-slot'],
  { revalidate: 60, tags: ['ads'] },
)

// ─── Merchant: إعلانات نشاطي ───

export async function getMyAds(businessId: string): Promise<MerchantAd[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('ads')
    .select(
      `
      id, slot_id, title, image_url, link_url, status,
      starts_at, ends_at, impressions, clicks, rejected_reason, created_at,
      slot:ad_slots(code, name_ar)
    `,
    )
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })

  if (!data) return []

  return data.map((r) => {
    const slot = r.slot as unknown as { code: string; name_ar: string } | null
    return {
      id: r.id,
      slot_id: r.slot_id,
      slot_name: slot?.name_ar ?? '—',
      slot_code: slot?.code ?? '—',
      title: r.title,
      image_url: r.image_url,
      link_url: r.link_url,
      status: r.status as MerchantAd['status'],
      starts_at: r.starts_at,
      ends_at: r.ends_at,
      impressions: r.impressions,
      clicks: r.clicks,
      rejected_reason: r.rejected_reason,
      created_at: r.created_at,
    }
  })
}

// ─── Admin: كل الإعلانات ───

export async function getAllAds(): Promise<AdminAd[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('ads')
    .select(
      `
      id, slot_id, title, image_url, link_url, status,
      starts_at, ends_at, impressions, clicks, rejected_reason, created_at,
      slot:ad_slots(code, name_ar),
      business:businesses(id, slug, name)
    `,
    )
    .order('created_at', { ascending: false })

  if (!data) return []

  return data.map((r) => {
    const slot = r.slot as unknown as { code: string; name_ar: string } | null
    const biz = r.business as unknown as { id: string; slug: string; name: string } | null
    return {
      id: r.id,
      slot_id: r.slot_id,
      slot_name: slot?.name_ar ?? '—',
      slot_code: slot?.code ?? '—',
      title: r.title,
      image_url: r.image_url,
      link_url: r.link_url,
      status: r.status as AdminAd['status'],
      starts_at: r.starts_at,
      ends_at: r.ends_at,
      impressions: r.impressions,
      clicks: r.clicks,
      rejected_reason: r.rejected_reason,
      created_at: r.created_at,
      business_name: biz?.name ?? '—',
      business_slug: biz?.slug ?? '—',
      business_id: biz?.id ?? '—',
    }
  })
}

// ─── Slots (للـ merchant + admin) ───

export type SlotOption = {
  id: string
  code: string
  name_ar: string
  description: string | null
  base_price_egp: number
}

export async function getAdSlots(): Promise<SlotOption[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('ad_slots')
    .select('id, code, name_ar, description, base_price_egp')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  return (data ?? []) as SlotOption[]
}
