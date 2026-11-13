// EAH — Phone Search Result Type (shared between server + client)
export type PhoneSearchResult =
  | { ok: false; error: string; detail?: string; hint?: string }
  | { ok: true; found: false; reason?: string; error?: string }
  | {
      ok: true
      found: true
      viewer: 'admin' | 'user'
      id?: string
      display_name: string
      avatar_url: string | null
      phone?: string
      trust_score: number
      trust_tier: string
      member_since: string
      is_verified: boolean
      is_premium: boolean
      allow_phone_lookup?: boolean
    }
