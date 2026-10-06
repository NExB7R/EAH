export type AdRow = {
  id: string
  slot_id: string
  slot_name: string
  slot_code: string
  title: string
  image_url: string | null
  link_url: string | null
  status: 'pending' | 'active' | 'paused' | 'expired' | 'rejected'
  starts_at: string | null
  ends_at: string | null
  impressions: number
  clicks: number
  rejected_reason: string | null
  created_at: string
}
