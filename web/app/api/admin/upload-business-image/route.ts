import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { uploadImage } from '@/lib/cloudinary'
import { logAudit } from '@/lib/logging/audit'
import { revalidatePath, revalidateTag } from 'next/cache'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ═══════════════════════════════════════════════════════════
// EAH — Admin Business Image Upload
// Handles logo/cover (single) + menu/gallery (multi) + URL paste.
// ═══════════════════════════════════════════════════════════

const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const ALLOWED_CATEGORIES = ['logo', 'cover', 'menu', 'gallery'] as const
type Category = (typeof ALLOWED_CATEGORIES)[number]

export async function POST(req: NextRequest) {
  const ctx = await requireAdmin()
  if (!ctx.ok) return NextResponse.json({ error: ctx.error }, { status: 401 })

  const formData = await req.formData()
  const fileRaw = formData.get('file')
  const urlRaw = formData.get('url')
  const category = String(formData.get('category') ?? '')
  const businessId = String(formData.get('businessId') ?? '')

  if (!ALLOWED_CATEGORIES.includes(category as Category)) {
    return NextResponse.json({ error: 'نوع الصورة غلط' }, { status: 400 })
  }
  if (!businessId) {
    return NextResponse.json({ error: 'businessId ناقص' }, { status: 400 })
  }

  const { data: biz } = await ctx.supabase
    .from('businesses')
    .select('id, slug')
    .eq('id', businessId)
    .maybeSingle()
  if (!biz) return NextResponse.json({ error: 'النشاط مش موجود' }, { status: 404 })

  let finalUrl: string

  if (fileRaw instanceof File) {
    if (!ALLOWED_TYPES.includes(fileRaw.type)) {
      return NextResponse.json({ error: 'الصيغة مش مدعومة' }, { status: 400 })
    }
    if (fileRaw.size > MAX_SIZE) {
      return NextResponse.json({ error: 'الحجم أكبر من 5MB' }, { status: 400 })
    }
    const folder = `eah/businesses/${businessId}/${category}`
    const result = await uploadImage(fileRaw, folder, MAX_SIZE)
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })
    finalUrl = result.url
  } else if (typeof urlRaw === 'string' && urlRaw.trim()) {
    const url = urlRaw.trim()
    if (url.length > 500) return NextResponse.json({ error: 'الرابط طويل جداً' }, { status: 400 })
    if (!url.startsWith('https://') && !url.startsWith('http://')) {
      return NextResponse.json(
        { error: 'الرابط لازم يبدأ بـ http:// أو https://' },
        { status: 400 },
      )
    }
    finalUrl = url
  } else {
    return NextResponse.json({ error: 'محتاج ملف أو رابط' }, { status: 400 })
  }

  let mediaId: string

  if (category === 'logo' || category === 'cover') {
    await ctx.supabase
      .from('business_media')
      .delete()
      .eq('business_id', businessId)
      .eq('media_type', category)

    const { data: inserted, error } = await ctx.supabase
      .from('business_media')
      .insert({
        business_id: businessId,
        media_type: category,
        storage_path: finalUrl,
        is_published: true,
        sort_order: 0,
      })
      .select('id')
      .single()

    if (error || !inserted) {
      return NextResponse.json({ error: error?.message ?? 'فشل الحفظ' }, { status: 500 })
    }
    mediaId = inserted.id

    if (category === 'cover') {
      await ctx.supabase
        .from('businesses')
        .update({ cover_image_url: finalUrl })
        .eq('id', businessId)
    }
  } else {
    const { count } = await ctx.supabase
      .from('business_media')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('media_type', category)

    const { data: inserted, error } = await ctx.supabase
      .from('business_media')
      .insert({
        business_id: businessId,
        media_type: category,
        storage_path: finalUrl,
        is_published: true,
        sort_order: (count ?? 0) + 1,
      })
      .select('id')
      .single()

    if (error || !inserted) {
      return NextResponse.json({ error: error?.message ?? 'فشل الحفظ' }, { status: 500 })
    }
    mediaId = inserted.id
  }

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'business.upload_media',
    entityType: 'business',
    entityId: businessId,
    metadata: { category, url: finalUrl },
  })

  revalidatePath(`/admin/businesses/${businessId}`)
  revalidateTag('businesses', 'default')

  return NextResponse.json({ ok: true, url: finalUrl, mediaId, category })
}

export async function DELETE(req: NextRequest) {
  const ctx = await requireAdmin()
  if (!ctx.ok) return NextResponse.json({ error: ctx.error }, { status: 401 })

  const url = new URL(req.url)
  const mediaId = url.searchParams.get('mediaId')
  if (!mediaId) return NextResponse.json({ error: 'mediaId مطلوب' }, { status: 400 })

  const { data: media } = await ctx.supabase
    .from('business_media')
    .select('id, business_id')
    .eq('id', mediaId)
    .maybeSingle()

  if (!media) return NextResponse.json({ error: 'الصورة مش موجودة' }, { status: 404 })

  const { error } = await ctx.supabase.from('business_media').delete().eq('id', mediaId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath(`/admin/businesses/${media.business_id}`)
  revalidateTag('businesses', 'default')

  return NextResponse.json({ ok: true })
}
