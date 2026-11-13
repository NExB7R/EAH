'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { PhoneLookupMode } from '@/lib/types/privacy'

type Input = {
  phone_lookup_mode: PhoneLookupMode
  hide_avatar: boolean
  hide_favorites: boolean
  hide_following: boolean
  hide_comments: boolean
  hide_reviews: boolean
}

type Result = { ok: true } | { ok: false; error: string }

const VALID_MODES: PhoneLookupMode[] = ['full', 'trust_only', 'anonymous']

export async function updateMyPrivacySettings(input: Input): Promise<Result> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'غير مصرح' }

  if (!VALID_MODES.includes(input.phone_lookup_mode)) {
    return { ok: false, error: 'وضع بحث غير صالح' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      phone_lookup_mode: input.phone_lookup_mode,
      hide_avatar: input.hide_avatar,
      hide_favorites: input.hide_favorites,
      hide_following: input.hide_following,
      hide_comments: input.hide_comments,
      hide_reviews: input.hide_reviews,
    })
    .eq('id', user.id)

  if (error) return { ok: false, error: 'فشل الحفظ — حاول تاني' }

  revalidatePath('/account')
  revalidatePath('/account/edit')
  revalidatePath('/admin/profile')
  revalidatePath('/', 'layout')
  return { ok: true }
}
