// EAH — Privacy Settings Types (shared server + client)
export type PhoneLookupMode = 'full' | 'trust_only' | 'anonymous'
export type DisplayNameMode = 'real' | 'alias' | 'both' | 'anonymous'

export type PrivacySettings = {
  phone_lookup_mode: PhoneLookupMode
  hide_avatar: boolean
  hide_favorites: boolean
  hide_following: boolean
  hide_comments: boolean
  hide_reviews: boolean
  display_name_mode: DisplayNameMode
}
