'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

const AVATAR_KEYS = ['av1','av2','av3','av4','av5','av6','av7','av8','av9','av10','av11','av12']

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/auth')

  const display_name = String(formData.get('display_name') ?? '').trim()
  const avatar_key = String(formData.get('avatar_key') ?? '').trim() || null
  const avatar_url = String(formData.get('avatar_url') ?? '').trim() || null
  const genderInput = String(formData.get('gender') ?? '').trim()
  const gender = genderInput === 'male' || genderInput === 'female' ? genderInput : null
  const bio = String(formData.get('bio') ?? '').trim() || null

  if (display_name.length < 2) throw new Error('الاسم لازم يكون حرفين على الأقل')
  if (display_name.length > 40) throw new Error('الاسم طويل جدًا')
  if (bio && bio.length > 200) throw new Error('البايو طويل جدًا')

  // فلترة أمنية
  const safeAvatarKey = avatar_key && AVATAR_KEYS.includes(avatar_key) ? avatar_key : null
  const safeAvatarUrl = avatar_url && /^https?:\/\//.test(avatar_url) ? avatar_url : null

  // نجمع التحديثات — ما نحطش avatar_url إلا لو موجود فعلاً
  const updates: Record<string, unknown> = {
    display_name,
    avatar_key: safeAvatarKey,
    bio,
    gender,
  }
  if (safeAvatarUrl) {
    updates.avatar_url = safeAvatarUrl
  }

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userData.user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/account')
  revalidatePath('/account/edit')
  redirect('/account?updated=1')
}
