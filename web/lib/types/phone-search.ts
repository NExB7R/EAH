// EAH — Phone Search Result Type (shared between server + client)
export type PhoneLookupMode = 'full' | 'anonymous'

export type LinkedBusiness = {
  id: string
  name: string
  slug: string
  type: string
  is_verified: boolean
  rating_avg: number
  rating_count: number
  is_open: boolean
  area: string | null
}

export type PhoneSearchResult =
  | { ok: false; error: string; detail?: string; hint?: string }
  | { ok: true; found: false; reason?: string; error?: string }
  | {
      ok: true
      found: true
      viewer: 'admin' | 'user'
      privacy_mode?: PhoneLookupMode
      // admin / full
      id?: string
      display_name?: string
      avatar_url?: string | null
      phone?: string
      bio?: string | null
      role?: 'super_admin' | 'merchant' | 'customer' | null
      member_since?: string
      // always present
      trust_score: number
      trust_tier: string
      is_verified: boolean
      is_premium: boolean
      business?: LinkedBusiness | null
    }
