'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { businessSchema } from '@/lib/admin/business-schema'
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
    name: String(formData.get('name') ?? ''),
    slug: String(formData.get('slug') ?? ''),
    business_type: String(formData.get('business_type') ?? ''),
    area: String(formData.get('area') ?? ''),
    city: String(formData.get('city') ?? 'شبين القناطر'),
    description: String(formData.get('description') ?? ''),
    hook: String(formData.get('hook') ?? ''),
    address_text: String(formData.get('address_text') ?? ''),
    phone: String(formData.get('phone') ?? ''),
    whatsapp: String(formData.get('whatsapp') ?? ''),
    is_open: formData.get('is_open') === 'on',
    is_featured: formData.get('is_featured') === 'on',
    is_published: formData.get('is_published') === 'on',
  }
}

export async function createBusiness(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = businessSchema.safeParse(formToObj(formData))
  if (!parsed.success) {
    return { ok: false, message: 'فيه أخطاء في الفورم', errors: parsed.error.flatten().fieldErrors }
  }
  const data = parsed.data
  const { supabase, user } = await assertAdmin()

  const { data: existing } = await supabase.from('businesses').select('id').eq('slug', data.slug).maybeSingle()
  if (existing) {
    return { ok: false, message: 'الـ slug ده مستخدم قبل كده', errors: { slug: ['اختار slug مختلف'] } }
  }

  const { data: created, error } = await supabase
    .from('businesses')
    .insert({
      name: data.name,
      slug: data.slug,
      business_type: data.business_type,
      area: data.area,
      city: data.city,
      description: data.description,
      hook: data.hook,
      address_text: data.address_text,
      is_open: data.is_open,
      is_featured: data.is_featured,
      is_published: data.is_published,
    })
    .select('id,slug')
    .single()

  if (error || !created) return { ok: false, message: error?.message ?? 'فشل الحفظ' }

  const contacts: Array<{ method_type: string; value: string }> = []
  if (data.phone) contacts.push({ method_type: 'phone', value: data.phone })
  if (data.whatsapp) contacts.push({ method_type: 'whatsapp', value: data.whatsapp })
  if (contacts.length > 0) {
    await supabase.from('business_contact_methods').insert(
      contacts.map((c, i) => ({
        business_id: created.id,
        method_type: c.method_type,
        value: c.value,
        is_primary: i === 0,
        is_public: true,
      }))
    )
  }

  await auditLog({
    action: 'business.create',
    entityType: 'business',
    entityId: created.id,
    after: { name: data.name, slug: data.slug, type: data.business_type },
    metadata: { actor_email: user.email ?? null },
  })

  revalidatePath('/admin/businesses')
  revalidatePath('/explore')
  revalidatePath('/')
  redirect(`/admin/businesses/${created.slug}/edit?saved=1`)
}

export async function updateBusiness(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = businessSchema.safeParse(formToObj(formData))
  if (!parsed.success) {
    return { ok: false, message: 'فيه أخطاء في الفورم', errors: parsed.error.flatten().fieldErrors }
  }
  const data = parsed.data
  const { supabase, user } = await assertAdmin()

  const { data: before } = await supabase.from('businesses').select('*').eq('id', id).maybeSingle()
  if (!before) return { ok: false, message: 'النشاط مش موجود' }

  if (data.slug !== before.slug) {
    const { data: dup } = await supabase.from('businesses').select('id').eq('slug', data.slug).neq('id', id).maybeSingle()
    if (dup) return { ok: false, message: 'الـ slug مستخدم قبل كده', errors: { slug: ['اختار slug مختلف'] } }
  }

  const { error } = await supabase.from('businesses').update({
    name: data.name,
    slug: data.slug,
    business_type: data.business_type,
    area: data.area,
    city: data.city,
    description: data.description,
    hook: data.hook,
    address_text: data.address_text,
    is_open: data.is_open,
    is_featured: data.is_featured,
    is_published: data.is_published,
  }).eq('id', id)

  if (error) return { ok: false, message: error.message }

  await supabase.from('business_contact_methods').delete().eq('business_id', id)
  const contacts: Array<{ method_type: string; value: string }> = []
  if (data.phone) contacts.push({ method_type: 'phone', value: data.phone })
  if (data.whatsapp) contacts.push({ method_type: 'whatsapp', value: data.whatsapp })
  if (contacts.length > 0) {
    await supabase.from('business_contact_methods').insert(
      contacts.map((c, i) => ({
        business_id: id,
        method_type: c.method_type,
        value: c.value,
        is_primary: i === 0,
        is_public: true,
      }))
    )
  }

  await auditLog({
    action: 'business.update',
    entityType: 'business',
    entityId: id,
    before,
    after: data,
    metadata: { actor_email: user.email ?? null },
  })

  revalidatePath('/admin/businesses')
  revalidatePath(`/businesses/${data.slug}`)
  revalidatePath('/explore')
  revalidatePath('/')
  return { ok: true, message: 'تم الحفظ ✅' }
}

export async function deleteBusiness(id: string): Promise<ActionState> {
  const { supabase, user } = await assertAdmin()
  const { data: before } = await supabase.from('businesses').select('*').eq('id', id).maybeSingle()
  if (!before) return { ok: false, message: 'النشاط مش موجود' }
  const { error } = await supabase.from('businesses').delete().eq('id', id)
  if (error) return { ok: false, message: error.message }
  await auditLog({
    action: 'business.delete',
    entityType: 'business',
    entityId: id,
    before,
    metadata: { actor_email: user.email ?? null },
  })
  revalidatePath('/admin/businesses')
  revalidatePath('/explore')
  revalidatePath('/')
  return { ok: true, message: 'تم الحذف' }
}

export async function toggleBusinessFlag(id: string, flag: 'is_featured' | 'is_published' | 'is_open'): Promise<ActionState> {
  const { supabase, user } = await assertAdmin()
  const { data: current } = await supabase.from('businesses').select(flag).eq('id', id).maybeSingle()
  if (!current) return { ok: false, message: 'النشاط مش موجود' }
  const currentValue = (current as Record<string, boolean>)[flag]
  const newValue = !currentValue
  const { error } = await supabase.from('businesses').update({ [flag]: newValue }).eq('id', id)
  if (error) return { ok: false, message: error.message }
  await auditLog({
    action: flag === 'is_featured' ? 'business.toggle_featured' : 'business.toggle_published',
    entityType: 'business',
    entityId: id,
    before: { [flag]: currentValue },
    after: { [flag]: newValue },
    metadata: { actor_email: user.email ?? null },
  })
  revalidatePath('/admin/businesses')
  revalidatePath('/explore')
  revalidatePath('/')
  return { ok: true }
}
