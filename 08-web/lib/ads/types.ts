export type AdSlotType = 'home_banner' | 'home_feed' | 'sidebar' | 'search_top' | 'business_sidebar'

export type AdSlot = {
  id: string
  code: string
  name_ar: string
  description: string | null
  slot_type: AdSlotType
  max_concurrent: number
  base_price_egp: number | null
  is_active: boolean
  display_order: number
}

export type Ad = {
  id: string
  slot_id: string | null
  owner_profile_id: string | null
  business_id: string | null
  title: string
  description: string | null
  image_url: string | null
  link_url: string | null
  link_type: 'external' | 'internal' | 'business'
  target_business_id: string | null
  starts_at: string
  ends_at: string | null
  status: 'pending' | 'active' | 'paused' | 'expired' | 'rejected'
  rejected_reason: string | null
  impressions: number
  clicks: number
  created_at: string
  slot?: AdSlot
}
