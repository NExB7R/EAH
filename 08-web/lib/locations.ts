import { createClient } from '@/lib/supabase-server'

export type SavedLocation = {
  id: string
  label: string | null
  latitude: number
  longitude: number
  accuracy: number | null
  address_text: string | null
  is_primary: boolean
  last_used_at: string
}

export async function getMyLocations(): Promise<SavedLocation[]> {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return []
  const { data } = await sb
    .from('customer_locations')
    .select('*')
    .eq('user_id', user.id)
    .order('is_primary', { ascending: false })
    .order('last_used_at', { ascending: false })
    .limit(20)
  return (data ?? []) as SavedLocation[]
}

export async function getPrimaryLocation(): Promise<SavedLocation | null> {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return null
  const { data } = await sb
    .from('customer_locations')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_primary', true)
    .maybeSingle()
  return (data as SavedLocation | null) ?? null
}

export async function saveLocation(input: {
  latitude: number
  longitude: number
  accuracy?: number
  label?: string
  address_text?: string
  is_primary?: boolean
}): Promise<{ ok: boolean; id?: string; reason?: string }> {
  const sb = await createClient()
  const { data, error } = await sb.rpc('save_customer_location', {
    p_lat: input.latitude,
    p_lng: input.longitude,
    p_label: input.label ?? null,
    p_accuracy: input.accuracy ?? null,
    p_address: input.address_text ?? null,
    p_make_primary: input.is_primary ?? false,
  })
  if (error) return { ok: false, reason: error.message }
  return data as { ok: boolean; id?: string; reason?: string }
}

export async function deleteLocation(id: string): Promise<boolean> {
  const sb = await createClient()
  const { error } = await sb.from('customer_locations').delete().eq('id', id)
  return !error
}
