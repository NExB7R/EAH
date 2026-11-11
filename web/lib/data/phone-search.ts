import { createClient } from '@/lib/supabase/server'

export type PhoneSearchResult =
  | { ok: false; error: string }
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

export async function searchCustomerByPhone(phone: string): Promise<PhoneSearchResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'يجب تسجيل الدخول' }

  const { data, error } = await supabase.rpc('search_customer_by_phone', { p_phone: phone })
  if (error) return { ok: false, error: 'تعذر تنفيذ البحث' }
  return (data as PhoneSearchResult) ?? { ok: false, error: 'استجابة غير صالحة' }
}
