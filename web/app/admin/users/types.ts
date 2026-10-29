export type AdminUser = {
  id: string
  display_name: string
  avatar_url: string | null
  phone: string | null
  phone_verified_at: string | null
  trust_score: number
  trust_tier: string
  created_at: string
  role: string | null
  banned_until: string | null
  ban_reason: string | null
  is_premium: boolean
  premium_until: string | null
  is_paid_member: boolean
  verified_at: string | null
}

export type UserFilter = 'all' | 'customers' | 'merchants' | 'admins' | 'premium' | 'banned'
