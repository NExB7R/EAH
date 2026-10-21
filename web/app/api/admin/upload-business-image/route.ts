import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { uploadImage, uploadRemoteImage } from '@/lib/cloudinary'
import { adminUploadLimiter, checkRateLimit } from '@/lib/rate-limit'
import { logAudit } from '@/lib/logging/audit'
import { createServiceClient } from '@/lib/supabase/service'
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

  const rateLimit = await checkRateLimit(adminUploadLimiter, `admin:${ctx.userId}`, {
    failClosed: true,
  })
  if (!rateLimit.ok) {
    const unavailable = rateLimit.error.startsWith('تعذر')
    return NextResponse.json(
      { error: rateLimit.error },
      {
        status: unavailable ? 503 : 429,
        headers: { 'Retry-After': String(rateLimit.retryAfter ?? 60) },
      },
    )
  }

  const declaredLength = Number(req.headers.get('content-length') ?? '0')
  if (Number.isFinite(declaredLength) && declaredLength > MAX_SIZE + 512 * 1024) {
    return NextResponse.json({ error: 'حجم الطلب أكبر من المسموح' }, { status: 413 })
  }

  const admin = createServiceClient()
  const formData = await req.formData().catch(() => null)
  if (!formData) {
    return NextResponse.json({ error: 'بيانات الرفع غير صحيحة' }, { status: 400 })
  }
  const fileRaw = formData.get('file')
  const urlRaw = formData.get('url')
  const category = String(formData.get('category') ?? '')
  const businessId = String(formData.get('businessId') ?? '')

  if (!ALLOWED_CATEGORIES.includes(category as Category)) {
    return NextResponse.json({ error: 'نوع الصورة غلط' }, { status: 400 })
  }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(businessId)) {
    return NextResponse.json({ error: 'معرّف النشاط غير صحيح' }, { status: 400 })
  }

  const { data: biz, error: bizError } = await admin
    .from('businesses')
    .select('id, slug')
    .eq('id', businessId)
    .maybeSingle()
  if (bizError) return NextResponse.json({ error: 'تعذر التحقق من النشاط' }, { status: 500 })
  if (!biz) return NextResponse.json({ error: 'النشاط مش موجود' }, { status: 404 })

  const folder = `eah/businesses/${businessId}/${category}`
  let finalUrl: string

  if (fileRaw instanceof File) {
    if (!ALLOWED_TYPES.includes(fileRaw.type)) {
      return NextResponse.json({ error: 'الصيغة مش مدعومة' }, { status: 400 })
    }
    if (fileRaw.size <= 0 || fileRaw.size > MAX_SIZE) {
      return NextResponse.json({ error: 'الحجم لازم يكون أكبر من صفر وأقل من 5MB' }, { status: 400 })
    }
    const result = await uploadImage(fileRaw, folder, MAX_SIZE)
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })
    finalUrl = result.url
  } else if (typeof urlRaw === 'string' && urlRaw.trim()) {
    const url = urlRaw.trim()
    if (url.length > 500) return NextResponse.json({ error: 'الرابط طويل جداً' }, { status: 400 })
    if (!url.toLowerCase().startsWith('https://')) {
      return NextResponse.json({ error: 'الرابط لازم يكون HTTPS آمن' }, { status: 400 })
    }
    const result = await uploadRemoteImage(url, folder, MAX_SIZE)
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })
    finalUrl = result.url
  } else {
    return NextResponse.json({ error: 'محتاج ملف أو رابط' }, { status: 400 })
  }

  let mediaId: string

  if (category === 'logo' || category === 'cover') {
    const { data: existingMedia, error: lookupError } = await admin
      .from('business_media')
      .select('id')
      .eq('business_id', businessId)
      .eq('media_type', category)
      .order('sort_order', { ascending: true })
      .limit(20)

    if (lookupError) {
      return NextResponse.json({ error: 'فشل التحقق من الصورة الحالية' }, { status: 500 })
    }

    const current = existingMedia?.[0]
    const duplicateIds = (existingMedia ?? []).slice(1).map((item) => item.id)

    if (duplicateIds.length > 0) {
      const { error: cleanupError } = await admin
        .from('business_media')
        .delete()
        .in('id', duplicateIds)

      if (cleanupError) {
        return NextResponse.json({ error: 'فشل تنظيف سجلات الصور المكررة' }, { status: 500 })
      }
    }

    if (current) {
      const { data: updated, error } = await admin
        .from('business_media')
        .update({ storage_path: finalUrl, is_published: true, sort_order: 0 })
        .eq('id', current.id)
        .select('id')
        .single()

      if (error || !updated) {
        return NextResponse.json({ error: error?.message ?? 'فشل الحفظ' }, { status: 500 })
      }
      mediaId = updated.id
    } else {
      const { data: inserted, error } = await admin
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
    }

    if (category === 'cover') {
      const { data: updatedBusiness, error: coverError } = await admin
        .from('businesses')
        .update({ cover_image_url: finalUrl })
        .eq('id', businessId)
        .select('id')
        .single()

      if (coverError || !updatedBusiness) {
        return NextResponse.json({ error: 'الصورة اتحفظت لكن فشل تحديث غلاف النشاط' }, { status: 500 })
      }
    }
  } else {
    const { count, error: countError } = await admin
      .from('business_media')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('media_type', category)

    if (countError) {
      return NextResponse.json({ error: 'فشل حساب ترتيب الصورة' }, { status: 500 })
    }

    const { data: inserted, error } = await admin
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

  await logAudit(admin, {
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

  const rateLimit = await checkRateLimit(adminUploadLimiter, `admin:${ctx.userId}`, {
    failClosed: true,
  })
  if (!rateLimit.ok) {
    const unavailable = rateLimit.error.startsWith('تعذر')
    return NextResponse.json(
      { error: rateLimit.error },
      {
        status: unavailable ? 503 : 429,
        headers: { 'Retry-After': String(rateLimit.retryAfter ?? 60) },
      },
    )
  }

  const admin = createServiceClient()
  const params = new URL(req.url).searchParams
  const mediaId = params.get('mediaId')
  const businessId = params.get('businessId')
  const categoryRaw = params.get('category')
  const category = categoryRaw as Category | null

  // Preferred path: remove a business logo/cover as a resource. This also clears
  // legacy cover_image_url when no business_media row exists.
  if (businessId && category && (category === 'logo' || category === 'cover')) {
    const { data: business, error: businessError } = await admin
      .from('businesses')
      .select('id, cover_image_url')
      .eq('id', businessId)
      .maybeSingle()

    if (businessError) {
      return NextResponse.json({ error: 'فشل التحقق من النشاط' }, { status: 500 })
    }
    if (!business) return NextResponse.json({ error: 'النشاط مش موجود' }, { status: 404 })

    const { data: mediaRows, error: mediaLookupError } = await admin
      .from('business_media')
      .select('id, storage_path')
      .eq('business_id', businessId)
      .eq('media_type', category)
      .order('sort_order', { ascending: true })
      .limit(20)

    if (mediaLookupError) {
      return NextResponse.json({ error: 'فشل التحقق من الصورة الحالية' }, { status: 500 })
    }
    if (category === 'logo' && (!mediaRows || mediaRows.length === 0)) {
      return NextResponse.json({ error: 'الصورة مش موجودة' }, { status: 404 })
    }

    if (category === 'cover') {
      const { data: updatedBusiness, error: coverError } = await admin
        .from('businesses')
        .update({ cover_image_url: null })
        .eq('id', businessId)
        .select('id')
        .single()

      if (coverError || !updatedBusiness) {
        return NextResponse.json({ error: 'فشل حذف غلاف النشاط' }, { status: 500 })
      }
    }

    const mediaIds = (mediaRows ?? []).map((item) => item.id)
    if (mediaIds.length > 0) {
      const { error: deleteError } = await admin.from('business_media').delete().in('id', mediaIds)

      if (deleteError) {
        if (category === 'cover') {
          await admin
            .from('businesses')
            .update({ cover_image_url: business.cover_image_url ?? mediaRows?.[0]?.storage_path ?? null })
            .eq('id', businessId)
        }
        return NextResponse.json({ error: 'فشل حذف الصورة من سجلات النشاط' }, { status: 500 })
      }
    }

    revalidatePath(`/admin/businesses/${businessId}`)
    revalidateTag('businesses', 'default')
    return NextResponse.json({ ok: true })
  }

  // Backward compatibility for callers that provide only mediaId.
  if (!mediaId) return NextResponse.json({ error: 'mediaId مطلوب' }, { status: 400 })

  const { data: media, error: mediaLookupError } = await admin
    .from('business_media')
    .select('id, business_id, media_type, storage_path')
    .eq('id', mediaId)
    .maybeSingle()

  if (mediaLookupError) {
    return NextResponse.json({ error: 'فشل التحقق من الصورة' }, { status: 500 })
  }
  if (!media) return NextResponse.json({ error: 'الصورة مش موجودة' }, { status: 404 })

  let oldCover: string | null = null
  if (media.media_type === 'cover') {
    const { data: business, error: businessError } = await admin
      .from('businesses')
      .select('cover_image_url')
      .eq('id', media.business_id)
      .maybeSingle()

    if (businessError || !business) {
      return NextResponse.json({ error: 'فشل التحقق من غلاف النشاط' }, { status: 500 })
    }
    oldCover = business.cover_image_url ?? media.storage_path

    const { error: coverError } = await admin
      .from('businesses')
      .update({ cover_image_url: null })
      .eq('id', media.business_id)

    if (coverError) return NextResponse.json({ error: 'فشل حذف غلاف النشاط' }, { status: 500 })
  }

  const { error: deleteError } = await admin.from('business_media').delete().eq('id', mediaId)
  if (deleteError) {
    if (media.media_type === 'cover') {
      await admin.from('businesses').update({ cover_image_url: oldCover }).eq('id', media.business_id)
    }
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  revalidatePath(`/admin/businesses/${media.business_id}`)
  revalidateTag('businesses', 'default')
  return NextResponse.json({ ok: true })
}
