'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { businessSchema, parseJson, type Contact, type WorkingHours } from '@/lib/admin/business-schema'
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
    map_url: String(formData.get('map_url') ?? ''),
    cover_image_url: String(formData.get('cover_image_url') ?? ''),
    gallery_json: String(formData.get('gallery_json') ?? '[]'),
    logo_json: String(formData.get('logo_json') ?? '[]'),
    cover_json: String(formData.get('cover_json') ?? '[]'),
    menu_json: String(formData.get('menu_json') ?? '[]'),
    working_hours_json: String(formData.get('working_hours_json') ?? '{}'),
    contacts_json: String(formData.get('contacts_json') ?? '[]'),
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
    return { ok: false, message: 'الـ slug مستخدم', errors: { slug: ['اختار slug مختلف'] } }
  }

  // ═══ فحص اسم النشاط (مطابق أو متشابه) ═══
  const { data: nameCheck } = await supabase.rpc('check_business_name_unique', {
    p_name: data.name,
    p_exclude_id: null,
  })
  if (nameCheck && nameCheck.ok === false) {
    return {
      ok: false,
      message: nameCheck.message || 'في نشاط بنفس الاسم',
      errors: { name: [nameCheck.message || 'اسم النشاط مستخدم'] },
    }
  }

  const gallery = parseJson<string[]>(data.gallery_json, [])
  const menu = parseJson<string[]>(data.menu_json, [])
  const workingHours = parseJson<WorkingHours>(data.working_hours_json, {})
  const contacts = parseJson<Contact[]>(data.contacts_json, []).filter((c) => c.value.trim())

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
      map_url: data.map_url,
      cover_image_url: parseJson<string[]>(data.cover_json, [])[0] || null,
      working_hours: workingHours,
      is_open: data.is_open,
      is_featured: data.is_featured,
      is_published: data.is_published,
    })
    .select('id,slug')
    .single()

  if (error || !created) return { ok: false, message: error?.message ?? 'فشل الحفظ' }

  if (contacts.length > 0) {
    const { error: cErr } = await supabase.from('business_contact_methods').insert(
      contacts.map((c) => ({
        business_id: created.id,
        method_type: c.method_type,
        value: c.value,
        is_primary: c.is_primary,
        is_public: true,
      }))
    )
    if (cErr) console.error('[createBusiness] contacts insert:', cErr)
  }

  if (gallery.length > 0) {
    const { error: gErr } = await supabase.from('business_media').insert(
      gallery.map((url, i) => ({
        business_id: created.id,
        media_type: 'gallery',
        storage_path: url,
        alt_text: `${data.name} - صورة ${i + 1}`,
        sort_order: i,
        is_published: true,
      }))
    )
    if (gErr) console.error('[createBusiness] gallery insert:', gErr)
  }
  if (menu.length > 0) {
    const { error: mErr } = await supabase.from('business_media').insert(
      menu.map((url, i) => ({
        business_id: created.id,
        media_type: 'menu',
        storage_path: url,
        alt_text: `${data.name} - منيو ${i + 1}`,
        sort_order: i,
        is_published: true,
      }))
    )
    if (mErr) console.error('[createBusiness] menu insert:', mErr)
  }

  // ═══ logo + cover في business_media ═══
  const logo = parseJson<string[]>(data.logo_json, [])
  const mediaRows: any[] = []
  if (data.cover_image_url) {
    mediaRows.push({
      business_id: created.id,
      media_type: 'cover',
      storage_path: data.cover_image_url,
      alt_text: `${data.name} - غلاف`,
      sort_order: 0,
      is_published: true,
    })
  }
  if (logo.length > 0) {
    mediaRows.push({
      business_id: created.id,
      media_type: 'logo',
      storage_path: logo[0],
      alt_text: `${data.name} - لوجو`,
      sort_order: 0,
      is_published: true,
    })
  }
  if (mediaRows.length > 0) {
    const { error: lErr } = await supabase.from('business_media').insert(mediaRows)
    if (lErr) console.error('[createBusiness] logo/cover insert:', lErr)
  }

  // ═══ food categories ═══
  const foodCats = parseJson<string[]>(String(formData.get('food_categories_json') ?? '[]'), [])
  if (foodCats.length > 0) {
    const { error: fErr } = await supabase.from('business_food_categories').insert(
      foodCats.map((k) => ({ business_id: created.id, category_key: k }))
    )
    if (fErr) console.error('[createBusiness] food_cats insert:', fErr)
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
    if (dup) return { ok: false, message: 'الـ slug مستخدم', errors: { slug: ['اختار slug مختلف'] } }
  }

  // ═══ فحص اسم النشاط (لو اتغير) ═══
  if (data.name !== before.name) {
    const { data: nameCheck } = await supabase.rpc('check_business_name_unique', {
      p_name: data.name,
      p_exclude_id: id,
    })
    if (nameCheck && nameCheck.ok === false) {
      return {
        ok: false,
        message: nameCheck.message || 'في نشاط بنفس الاسم',
        errors: { name: [nameCheck.message || 'اسم النشاط مستخدم'] },
      }
    }
  }

  const gallery = parseJson<string[]>(data.gallery_json, [])
  const menu = parseJson<string[]>(data.menu_json, [])
  const workingHours = parseJson<WorkingHours>(data.working_hours_json, {})
  const contacts = parseJson<Contact[]>(data.contacts_json, []).filter((c) => c.value.trim())

  const { error } = await supabase.from('businesses').update({
    name: data.name,
    slug: data.slug,
    business_type: data.business_type,
    area: data.area,
    city: data.city,
    description: data.description,
    hook: data.hook,
    address_text: data.address_text,
    map_url: data.map_url,
    cover_image_url: parseJson<string[]>(data.cover_json, [])[0] || null,
    working_hours: workingHours,
    is_open: data.is_open,
    is_featured: data.is_featured,
    is_published: data.is_published,
  }).eq('id', id)

  if (error) return { ok: false, message: error.message }

  await supabase.from('business_contact_methods').delete().eq('business_id', id)
  if (contacts.length > 0) {
    const { error: cErr } = await supabase.from('business_contact_methods').insert(
      contacts.map((c) => ({
        business_id: id,
        method_type: c.method_type,
        value: c.value,
        is_primary: c.is_primary,
        is_public: true,
      }))
    )
    if (cErr) console.error('[updateBusiness] contacts insert:', cErr)
  }

  await supabase.from('business_media').delete().eq('business_id', id).in('media_type', ['gallery', 'menu', 'logo', 'cover'])
  if (gallery.length > 0) {
    const { error: gErr } = await supabase.from('business_media').insert(
      gallery.map((url, i) => ({
        business_id: id,
        media_type: 'gallery',
        storage_path: url,
        alt_text: `${data.name} - صورة ${i + 1}`,
        sort_order: i,
        is_published: true,
      }))
    )
    if (gErr) console.error('[updateBusiness] gallery insert:', gErr)
  }
  if (menu.length > 0) {
    const { error: mErr } = await supabase.from('business_media').insert(
      menu.map((url, i) => ({
        business_id: id,
        media_type: 'menu',
        storage_path: url,
        alt_text: `${data.name} - منيو ${i + 1}`,
        sort_order: i,
        is_published: true,
      }))
    )
    if (mErr) console.error('[updateBusiness] menu insert:', mErr)
  }

  // ═══ logo + cover في business_media ═══
  const logo = parseJson<string[]>(data.logo_json, [])
  const mediaRows: any[] = []
  if (data.cover_image_url) {
    mediaRows.push({
      business_id: id,
      media_type: 'cover',
      storage_path: data.cover_image_url,
      alt_text: `${data.name} - غلاف`,
      sort_order: 0,
      is_published: true,
    })
  }
  if (logo.length > 0) {
    mediaRows.push({
      business_id: id,
      media_type: 'logo',
      storage_path: logo[0],
      alt_text: `${data.name} - لوجو`,
      sort_order: 0,
      is_published: true,
    })
  }
  if (mediaRows.length > 0) {
    const { error: lErr } = await supabase.from('business_media').insert(mediaRows)
    if (lErr) console.error('[updateBusiness] logo/cover insert:', lErr)
  }

  // ═══ food categories ═══
  const foodCats = parseJson<string[]>(String(formData.get('food_categories_json') ?? '[]'), [])
  await supabase.from('business_food_categories').delete().eq('business_id', id)
  if (foodCats.length > 0) {
    const { error: fErr } = await supabase.from('business_food_categories').insert(
      foodCats.map((k) => ({ business_id: id, category_key: k }))
    )
    if (fErr) console.error('[updateBusiness] food_cats insert:', fErr)
  }

  await auditLog({
    action: 'business.update',
    entityType: 'business',
    entityId: id,
    before,
    after: { ...data, gallery_count: gallery.length, menu_count: menu.length, contacts_count: contacts.length },
    metadata: { actor_email: user.email ?? null },
  })

  revalidatePath('/admin/businesses')
  revalidatePath(`/businesses/${data.slug}`)
  revalidatePath('/explore')
  revalidatePath('/')
  return { ok: true, message: 'تم الحفظ' }
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
