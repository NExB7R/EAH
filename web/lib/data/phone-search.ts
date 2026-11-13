import { createClient } from '@/lib/supabase/server'
import type { PhoneSearchResult } from '@/lib/types/phone-search'

export type { PhoneSearchResult }

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
