'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { AREAS } from '@/lib/data/areas'

// ═══════════════════════════════════════════════════════════
// EAH — Account Edit Server Actions
// §26 — Single Source of Truth
// ═══════════════════════════════════════════════════════════

type ActionResult = { ok: true } | { ok: false; error: string }

const VALID_MODES = ['real', 'alias', 'both', 'anonymous'] as const
const VALID_GENDERS = ['male', 'female'] as const

type Mode = (typeof VALID_MODES)[number]
type Gender = (typeof VALID_GENDERS)[number]

function isMode(v: string): v is Mode {
  return (VALID_MODES as readonly string[]).includes(v)
}

function isGender(v: string): v is Gender {
  return (VALID_GENDERS as readonly string[]).includes(v)
}

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return { supabase, user }
}

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await requireUser()
  if (!user || user.is_anonymous) return { ok: false, error: 'غير مصرح' }

  const display_name = String(formData.get('display_name') ?? '').trim()
  const alias_raw = String(formData.get('alias') ?? '').trim()
  const bio_raw = String(formData.get('bio') ?? '').trim()
  const gender_raw = String(formData.get('gender') ?? '').trim()
  const mode_raw = String(formData.get('display_name_mode') ?? 'real').trim()

  if (!display_name) return { ok: false, error: 'الاسم مطلوب' }
  if (display_name.length > 50) return { ok: false, error: 'الاسم أطول من 50 حرف' }
  if (bio_raw.length > 200) return { ok: false, error: 'النبذة أطول من 200 حرف' }
  if (alias_raw.length > 30) return { ok: false, error: 'الكنية أطول من 30 حرف' }
  if (!isMode(mode_raw)) return { ok: false, error: 'وضع الظهور غير صحيح' }
  if (mode_raw === 'alias' && !alias_raw) {
    return { ok: false, error: 'لازم تدخل كنية عشان تظهر بيها' }
  }
  if (mode_raw === 'both' && !alias_raw) {
    return { ok: false, error: 'لازم تدخل كنية عشان تظهر مع اسمك' }
  }

  const gender = gender_raw && isGender(gender_raw) ? gender_raw : null
  const alias = alias_raw || null
  const bio = bio_raw || null

  const { error } = await supabase
    .from('profiles')
    .update({ display_name, gender, bio, alias, display_name_mode: mode_raw })
    .eq('id', user.id)

  if (error) return { ok: false, error: 'فشل الحفظ — حاول تاني' }

  revalidatePath('/account')
  revalidatePath('/account/edit')
  return { ok: true }
}

export async function saveNearbyLocation(formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await requireUser()
  if (!user || user.is_anonymous) return { ok: false, error: 'سجّل دخولك الأول عشان نحفظ موقعك' }

  const latitude = Number(formData.get('latitude'))
  const longitude = Number(formData.get('longitude'))
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
      !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    return { ok: false, error: 'إحداثيات الموقع غير صحيحة' }
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ default_latitude: latitude, default_longitude: longitude })
    .eq('id', user.id)
    .select('id')
    .maybeSingle()

  if (error || !data) return { ok: false, error: 'تعذر حفظ موقعك. جرّب مرة تانية' }

  revalidatePath('/')
  revalidatePath('/nearby')
  revalidatePath('/account/edit')
  return { ok: true }
}

export async function saveNearbyArea(formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await requireUser()
  if (!user || user.is_anonymous) return { ok: false, error: 'سجّل دخولك الأول عشان نحفظ منطقتك' }

  const area = String(formData.get('area') ?? '').trim()
  if (!area || !(AREAS as readonly string[]).includes(area)) {
    return { ok: false, error: 'اختار منطقة صحيحة من القائمة' }
  }

  // A manual area choice replaces stale GPS coordinates; no distance is shown
  // until the member explicitly grants precise location again.
  const { data, error } = await supabase
    .from('profiles')
    .update({ default_area: area, default_latitude: null, default_longitude: null })
    .eq('id', user.id)
    .select('id')
    .maybeSingle()

  if (error || !data) return { ok: false, error: 'تعذر حفظ المنطقة. جرّب مرة تانية' }

  revalidatePath('/')
  revalidatePath('/nearby')
  return { ok: true }
}

export async function updatePrivacy(formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await requireUser()
  if (!user || user.is_anonymous) return { ok: false, error: 'غير مصرح' }

  const hide_avatar = formData.get('hide_avatar') === 'on'
  const hide_favorites = formData.get('hide_favorites') === 'on'
  const hide_following = formData.get('hide_following') === 'on'

  const { error } = await supabase
    .from('profiles')
    .update({ hide_avatar, hide_favorites, hide_following })
    .eq('id', user.id)

  if (error) return { ok: false, error: 'فشل الحفظ — حاول تاني' }

  revalidatePath('/account/edit')
  return { ok: true }
}
