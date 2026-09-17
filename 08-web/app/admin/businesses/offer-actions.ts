'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { offerSchema } from '@/lib/admin/offer-schema'
import { auditLog } from '@/lib/admin/audit'

type ActionState = { ok: boolean; message?: string; errors?: Record<string, string[]> }

async function assertAdmin() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/admin/login')
  const { data: roleRow } = await supabase
    .from('user_roles').select('role').eq('user_id', userData.user.id).maybeSingle()
  if (roleRow?.role !== 'super_admin') throw new Error('Unauthorized')
  return { supabase, user: userData.user }
}

function formToObj(formData: FormData) {
  return {
    title: String(formData.get('title') ?? ''),
    description: String(formData.get('description') ?? ''),
    price: String(formData.get('price') ?? ''),
    old_price: String(formData.get('old_price') ?? ''),
    image_url: String(formData.get('image_url') ?? ''),
    starts_at: String(formData.get('starts_at') ?? ''),
    ends_at: String(formData.get('ends_at') ?? ''),
    is_published: formData.get('is_published') === 'on',
  }
}

// ============================================================
// CREATE
// ============================================================
export async function createOffer(
  businessId: string,
  businessSlug: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = offerSchema.safeParse(formToObj(formData))
  if (!parsed.success) {
    return { ok: false, message: 'فيه أخطاء', errors: parsed.error.flatten().fieldErrors }
  }
  const data = parsed.data
  const { supabase, user } = await assertAdmin()

  const { data: created, error } = await supabase
    .from('offers')
    .insert({
      business_id: businessId,
      title: data.title,
      description: data.description,
      price: data.price,
      teaser_image_path: data.image_url,
      image_url: data.image_url,
      starts_at: data.starts_at,
      ends_at: data.ends_at,
      is_published: data.is_published,
    })
    .select('id')
    .single()

  if (error || !created) return { ok: false, message: error?.message ?? 'فشل الحفظ' }

  await auditLog({
    action: 'business.update',
    entityType: 'offer',
    entityId: created.id,
    after: { title: data.title, business_slug: businessSlug },
    metadata: { actor_email: user.email ?? null, kind: 'offer.create' },
  })

  revalidatePath(`/admin/businesses/${businessSlug}/offers`)
  revalidatePath(`/businesses/${businessSlug}`)
  redirect(`/admin/businesses/${businessSlug}/offers?saved=1`)
}

// ============================================================
// UPDATE
// ============================================================
export async function updateOffer(
  offerId: string,
  businessSlug: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = offerSchema.safeParse(formToObj(formData))
  if (!parsed.success) {
    return { ok: false, message: 'فيه أخطاء', errors: parsed.error.flatten().fieldErrors }
  }
  const data = parsed.data
  const { supabase } = await assertAdmin()

  const { error } = await supabase
    .from('offers')
    .update({
      title: data.title,
      description: data.description,
      price: data.price,
      teaser_image_path: data.image_url,
      image_url: data.image_url,
      starts_at: data.starts_at,
      ends_at: data.ends_at,
      is_published: data.is_published,
    })
    .eq('id', offerId)

  if (error) return { ok: false, message: error.message }

  revalidatePath(`/admin/businesses/${businessSlug}/offers`)
  revalidatePath(`/businesses/${businessSlug}`)
  return { ok: true, message: 'تم الحفظ' }
}

// ============================================================
// DELETE
// ============================================================
export async function deleteOffer(offerId: string, businessSlug: string): Promise<ActionState> {
  const { supabase } = await assertAdmin()

  const { error } = await supabase.from('offers').delete().eq('id', offerId)
  if (error) return { ok: false, message: error.message }

  revalidatePath(`/admin/businesses/${businessSlug}/offers`)
  revalidatePath(`/businesses/${businessSlug}`)
  return { ok: true, message: 'تم الحذف' }
}

// ============================================================
// TOGGLE
// ============================================================
export async function toggleOfferPublished(offerId: string, businessSlug: string, current: boolean): Promise<ActionState> {
  const { supabase } = await assertAdmin()

  const { error } = await supabase
    .from('offers')
    .update({ is_published: !current })
    .eq('id', offerId)

  if (error) return { ok: false, message: error.message }

  revalidatePath(`/admin/businesses/${businessSlug}/offers`)
  revalidatePath(`/businesses/${businessSlug}`)
  return { ok: true }
}
