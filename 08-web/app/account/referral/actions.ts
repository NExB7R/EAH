'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase-server'

export async function claimReferral(formData: FormData) {
  const code = String(formData.get('code') ?? '').trim()
  if (!code) return { ok: false, message: 'اكتب الكود' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, message: 'مش مسجل دخول' }

  const { data, error } = await supabase.rpc('claim_referral', { p_code: code })
  if (error) return { ok: false, message: error.message }
  const r = data as any
  if (!r?.ok) {
    const msgs: Record<string, string> = {
      already_claimed: 'استعملت كود من قبل',
      invalid_code: 'الكود مش صحيح',
      not_authenticated: 'مش مسجل دخول',
    }
    return { ok: false, message: msgs[r?.reason] ?? 'حصل خطأ' }
  }

  revalidatePath('/account/referral')
  revalidatePath('/account')
  return { ok: true, message: `🎉 كسبت ${r.bonus} نقطة!` }
}
