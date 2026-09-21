'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase-server'
import { z } from 'zod'

const schema = z.object({
  name: z.string().trim().min(2, 'اسم الفرع قصير').max(100),
  area: z.string().trim().min(2, 'المنطقة مطلوبة').max(60),
  address_text: z.string().trim().max(200).optional(),
  latitude: z.coerce.number().nullable().optional(),
  longitude: z.coerce.number().nullable().optional(),
  phone: z.string().trim().max(30).optional(),
  whatsapp: z.string().trim().max(30).optional(),
  is_primary: z.boolean().optional(),
  is_active: z.boolean().optional(),
})

type ActionState = { ok: boolean; message?: string }

async function assertOwnerOrAdmin(businessId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('unauthorized')

  const [bizRes, roleRes] = await Promise.all([
    supabase.from('businesses').select('owner_profile_id,slug').eq('id', businessId).maybeSingle(),
    supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle(),
  ])

  const isOwner = bizRes.data?.owner_profile_id === user.id
  const isAdmin = roleRes.data?.role === 'super_admin'
  if (!isOwner && !isAdmin) throw new Error('unauthorized')

  return { supabase, slug: bizRes.data?.slug ?? '' }
}

export async function addBranch(prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const businessId = String(formData.get('business_id'))
    const { supabase, slug } = await assertOwnerOrAdmin(businessId)

    const parsed = schema.safeParse({
      name: formData.get('name'),
      area: formData.get('area'),
      address_text: formData.get('address_text') || undefined,
      latitude: formData.get('latitude') || null,
      longitude: formData.get('longitude') || null,
      phone: formData.get('phone') || undefined,
      whatsapp: formData.get('whatsapp') || undefined,
      is_primary: formData.get('is_primary') === 'on',
      is_active: true,
    })
    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message ?? 'بيانات مش صحيحة' }
    }

    const { error } = await supabase.from('business_branches').insert({
      business_id: businessId,
      ...parsed.data,
    })
    if (error) return { ok: false, message: error.message }

    revalidatePath(`/admin/businesses/${slug}/branches`)
    revalidatePath(`/merchant/businesses/${slug}/branches`)
    revalidatePath(`/businesses/${slug}`)
    return { ok: true }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : 'خطأ' }
  }
}

export async function updateBranch(prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const id = String(formData.get('id'))
    const businessId = String(formData.get('business_id'))
    const { supabase, slug } = await assertOwnerOrAdmin(businessId)

    const parsed = schema.safeParse({
      name: formData.get('name'),
      area: formData.get('area'),
      address_text: formData.get('address_text') || undefined,
      latitude: formData.get('latitude') || null,
      longitude: formData.get('longitude') || null,
      phone: formData.get('phone') || undefined,
      whatsapp: formData.get('whatsapp') || undefined,
      is_primary: formData.get('is_primary') === 'on',
      is_active: formData.get('is_active') === 'on',
    })
    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message ?? 'بيانات مش صحيحة' }
    }

    const { error } = await supabase.from('business_branches').update(parsed.data).eq('id', id)
    if (error) return { ok: false, message: error.message }

    revalidatePath(`/admin/businesses/${slug}/branches`)
    revalidatePath(`/merchant/businesses/${slug}/branches`)
    revalidatePath(`/businesses/${slug}`)
    return { ok: true }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : 'خطأ' }
  }
}

export async function deleteBranch(id: string, businessId: string): Promise<ActionState> {
  try {
    const { supabase, slug } = await assertOwnerOrAdmin(businessId)
    const { error } = await supabase.from('business_branches').delete().eq('id', id)
    if (error) return { ok: false, message: error.message }

    revalidatePath(`/admin/businesses/${slug}/branches`)
    revalidatePath(`/merchant/businesses/${slug}/branches`)
    revalidatePath(`/businesses/${slug}`)
    return { ok: true }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : 'خطأ' }
  }
}

export async function setPrimary(id: string, businessId: string): Promise<ActionState> {
  try {
    const { supabase, slug } = await assertOwnerOrAdmin(businessId)
    const { error } = await supabase.from('business_branches').update({ is_primary: true }).eq('id', id)
    if (error) return { ok: false, message: error.message }

    revalidatePath(`/admin/businesses/${slug}/branches`)
    revalidatePath(`/merchant/businesses/${slug}/branches`)
    revalidatePath(`/businesses/${slug}`)
    return { ok: true }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : 'خطأ' }
  }
}

export async function toggleBranchActive(id: string, businessId: string, current: boolean): Promise<ActionState> {
  try {
    const { supabase, slug } = await assertOwnerOrAdmin(businessId)
    const { error } = await supabase.from('business_branches').update({ is_active: !current }).eq('id', id)
    if (error) return { ok: false, message: error.message }

    revalidatePath(`/admin/businesses/${slug}/branches`)
    revalidatePath(`/merchant/businesses/${slug}/branches`)
    revalidatePath(`/businesses/${slug}`)
    return { ok: true }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : 'خطأ' }
  }
}
