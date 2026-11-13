import { createClient } from '@/lib/supabase/server'
import type { PrivacySettings } from '@/lib/types/privacy'

export async function getMyPrivacySettings(): Promise<PrivacySettings | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_my_privacy_settings').maybeSingle()
  if (error || !data) return null
  const d = data as Record<string, unknown>
  if (d.ok !== true) return null
  return {
    phone_lookup_mode: (d.phone_lookup_mode as PrivacySettings['phone_lookup_mode']) ?? 'full',
    hide_avatar: Boolean(d.hide_avatar),
    hide_favorites: Boolean(d.hide_favorites),
    hide_following: Boolean(d.hide_following),
    hide_comments: Boolean(d.hide_comments),
    hide_reviews: Boolean(d.hide_reviews),
    display_name_mode: (d.display_name_mode as PrivacySettings['display_name_mode']) ?? 'real',
  }
}
