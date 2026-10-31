'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// ═══════════════════════════════════════════════════════════
// EAH — Merchant Branches Actions
// ═══════════════════════════════════════════════════════════

type Result = { ok: true; id?: string } | { ok: false; error: string }

const schema = z.object({
  name: z.string().min(2, 'اسم الفرع قصير').max(80),
  area: z.string().min(2, 'المنطقة مطلوبة').max(50),
  address_text: z.string().max(200).optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  whatsapp: z.string().max(20).optional().or(z.literal('')),
  latitude: z.coerce.number().min(-90).max(90).nullable().optional(),
  longitude: z.coerce.number().min(-180).max(180).nullable().optional(),
})

async function myBiz() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || user.is_anonymous) return { ok: false as const, error: 'لازم تسجل بحساب مسجل الأول' }

  const { data: biz } = await supabase
    .from('businesses')
    .select('id, slug')
    .eq('owner_profile_id', user.id)
    .limit(1)
    .maybeSingle()

  if (!biz) return { ok: false as const, error: 'مفيش نشاط مرتبط بحسابك' }
  return { ok: true as const, supabase, biz }
}

function parseCoords(raw: string): number | null {
  const v = raw.trim()
  if (!v) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function parseBranch(formData: FormData) {
  return schema.safeParse({
    name: String(formData.get('name') ?? '').trim(),
    area: String(formData.get('area') ?? '').trim(),
    address_text: String(formData.get('address_text') ?? '').trim(),
    phone: String(formData.get('phone') ?? '').trim(),
    whatsapp: String(formData.get('whatsapp') ?? '').trim(),
    latitude: parseCoords(String(formData.get('latitude') ?? '')),
    longitude: parseCoords(String(formData.get('longitude') ?? '')),
  })
}

export async function createBranch(formData: FormData): Promise<Result> {
  const ctx = await myBiz()
  if (!ctx.ok) return { ok: false, error: ctx.error }

  const parsed = parseBranch(formData)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة' }
  }

  const d = parsed.data

  // لو ده أول فرع، يبقى primary
  const { count } = await ctx.supabase
    .from('business_branches')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', ctx.biz.id)

  const isPrimary = !count || count === 0

  const branchRow = {
    business_id: ctx.biz.id,
    name: d.name,
    area: d.area,
    address_text: d.address_text || null,
    phone: d.phone || null,
    whatsapp: d.whatsapp || null,
    latitude: d.latitude ?? null,
    longitude: d.longitude ?? null,
    is_primary: isPrimary,
    is_active: true,
    sort_order: count ?? 0,
  }

  let { data, error } = await ctx.supabase
    .from('business_branches')
    .insert(branchRow)
    .select('id')
    .single()

  // Two concurrent first-branch submissions can both observe a zero count.
  // The database's partial unique index decides which one is primary; retry
  // the losing request as a regular branch rather than failing the creation.
  if (
    error?.code === '23505' &&
    error.message.includes('business_branches_one_primary_per_business') &&
    isPrimary
  ) {
    const { data: lastBranch } = await ctx.supabase
      .from('business_branches')
      .select('sort_order')
      .eq('business_id', ctx.biz.id)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle()

    const retry = await ctx.supabase
      .from('business_branches')
      .insert({ ...branchRow, is_primary: false, sort_order: (lastBranch?.sort_order ?? 0) + 1 })
      .select('id')
      .single()

    data = retry.data
    error = retry.error
  }

  if (error || !data) {
    console.error('[merchant-branches] branch creation failed:', error?.message ?? 'No row returned')
    return { ok: false, error: 'تعذر حفظ الفرع. حدّث الصفحة وحاول مرة أخرى.' }
  }

  revalidatePath('/merchant/branches')
  revalidateTag('businesses', 'default')
  return { ok: true, id: data.id }
}

export async function updateBranch(id: string, formData: FormData): Promise<Result> {
  const ctx = await myBiz()
  if (!ctx.ok) return { ok: false, error: ctx.error }

  const parsed = parseBranch(formData)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة' }
  }

  const d = parsed.data

  const { error } = await ctx.supabase
    .from('business_branches')
    .update({
      name: d.name,
      area: d.area,
      address_text: d.address_text || null,
      phone: d.phone || null,
      whatsapp: d.whatsapp || null,
      latitude: d.latitude ?? null,
      longitude: d.longitude ?? null,
    })
    .eq('id', id)
    .eq('business_id', ctx.biz.id)

  if (error) return { ok: false, error: 'تعذر تنفيذ العملية. حاول مرة أخرى.' }

  revalidatePath('/merchant/branches')
  revalidateTag('businesses', 'default')
  return { ok: true, id }
}

export async function deleteBranch(id: string): Promise<Result> {
  const ctx = await myBiz()
  if (!ctx.ok) return { ok: false, error: ctx.error }

  // تأكد إن مش الفرع الأساسي
  const { data: branch } = await ctx.supabase
    .from('business_branches')
    .select('is_primary')
    .eq('id', id)
    .eq('business_id', ctx.biz.id)
    .maybeSingle()

  if (!branch) return { ok: false, error: 'الفرع مش موجود' }
  if (branch.is_primary) {
    return { ok: false, error: 'مش ممكن تمسح الفرع الأساسي — عيّن فرع تاني أساسي الأول' }
  }

  const { error } = await ctx.supabase
    .from('business_branches')
    .delete()
    .eq('id', id)
    .eq('business_id', ctx.biz.id)

  if (error) return { ok: false, error: 'تعذر تنفيذ العملية. حاول مرة أخرى.' }

  // Re-number sort_order (best-effort)
  const { data: remaining } = await ctx.supabase
    .from('business_branches')
    .select('id')
    .eq('business_id', ctx.biz.id)
    .order('sort_order', { ascending: true })

  if (remaining) {
    for (let i = 0; i < remaining.length; i++) {
      const br = remaining[i]
      if (!br) continue
      await ctx.supabase.from('business_branches').update({ sort_order: i }).eq('id', br.id)
    }
  }

  revalidatePath('/merchant/branches')
  revalidateTag('businesses', 'default')
  return { ok: true }
}

export async function setPrimaryBranch(id: string): Promise<Result> {
  const ctx = await myBiz()
  if (!ctx.ok) return { ok: false, error: ctx.error }

  // Verify target branch belongs to this business
  const { data: target } = await ctx.supabase
    .from('business_branches')
    .select('id, is_primary')
    .eq('id', id)
    .eq('business_id', ctx.biz.id)
    .maybeSingle()

  if (!target) return { ok: false, error: 'الفرع مش موجود' }
  if (target.is_primary) return { ok: true, id } // already primary — no-op

  // Set target primary FIRST — if unique constraint exists it protects us;
  // else we still can recover by unsetting others
  const { error: setErr } = await ctx.supabase
    .from('business_branches')
    .update({ is_primary: true })
    .eq('id', id)
    .eq('business_id', ctx.biz.id)

  if (setErr) return { ok: false, error: setErr.message }

  // Unset all OTHER branches (not target — keeps target primary)
  const { error: resetErr } = await ctx.supabase
    .from('business_branches')
    .update({ is_primary: false })
    .eq('business_id', ctx.biz.id)
    .neq('id', id)

  if (resetErr) {
    // Best-effort — DB still consistent (2 primaries is less harmful than 0)
    return { ok: false, error: 'حدث خطأ — قد يوجد أكثر من فرع أساسي' }
  }

  revalidatePath('/merchant/branches')
  revalidateTag('businesses', 'default')
  return { ok: true, id }
}

export async function toggleBranchActive(id: string, active: boolean): Promise<Result> {
  const ctx = await myBiz()
  if (!ctx.ok) return { ok: false, error: ctx.error }

  const { error } = await ctx.supabase
    .from('business_branches')
    .update({ is_active: active })
    .eq('id', id)
    .eq('business_id', ctx.biz.id)

  if (error) return { ok: false, error: 'تعذر تنفيذ العملية. حاول مرة أخرى.' }

  revalidatePath('/merchant/branches')
  revalidateTag('businesses', 'default')
  return { ok: true, id }
}
