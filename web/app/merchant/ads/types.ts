export type AdRow = {
  id: string
  slot_id: string
  slot_name: string
  slot_code: string
  title: string
  image_url: string | null
  link_url: string | null
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'expired' | 'paused'
  price_paid_egp: number
  starts_at: string | null
  ends_at: string | null
  impressions: number
  clicks: number
  rejection_reason: string | null
  created_at: string
}
