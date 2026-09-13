'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { isFrameAllowed, isTitleAllowed, type Role, type Gender } from '@/lib/profile-presets'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/auth')

  const display_name = String(formData.get('display_name') ?? '').trim()
  const avatar_key = String(formData.get('avatar_key') ?? '').trim() || null
  const title_key = String(formData.get('title_key') ?? '').trim() || null
  const frame_key = String(formData.get('frame_key') ?? '').trim() || null
  const avatar_url = String(formData.get('avatar_url') ?? '').trim() || null
  const genderInput = String(formData.get('gender') ?? '').trim()
  const genderValue: 'male' | 'female' | null = genderInput === 'male' || genderInput === 'female' ? genderInput : null
  const bio = String(formData.get('bio') ?? '').trim() || null

  if (display_name.length < 2) {
    throw new Error('الاسم لازم يكون حرفين على الأقل')
  }
  if (display_name.length > 40) {
    throw new Error('الاسم طويل جدًا')
  }
  if (bio && bio.length > 200) {
    throw new Error('البايو طويل جدًا (200 حرف كحد أقصى)')
  }

  // فلترة أمنية: نتأكد إن الإطار واللقب مسموحين للدور
  const { data: roleRow } = await supabase
    .from('user_roles').select('role').eq('user_id', userData.user.id).maybeSingle()
  const role = (roleRow?.role ?? 'customer') as Role

  const { data: prof } = await supabase
    .from('profiles').select('gender').eq('id', userData.user.id).maybeSingle()
  const existingGender = (prof?.gender ?? null) as Gender | null

  if (frame_key && !isFrameAllowed(frame_key, role)) {
    throw new Error('الإطار ده مش متاح لحسابك')
  }
  if (title_key && !isTitleAllowed(title_key, role, genderValue)) {
    throw new Error('اللقب ده مش متاح لحسابك')
  }

  const { error } = await supabase
    .from('profiles')
    .update({ display_name, avatar_key, title_key, frame_key, bio, avatar_url, gender: genderValue })
    .eq('id', userData.user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/account')
  revalidatePath('/account/edit')
  redirect('/account?updated=1')
}
