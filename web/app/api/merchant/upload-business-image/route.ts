import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { deleteImage, uploadImage } from '@/lib/cloudinary'
import { strictLimiter, checkRateLimit, getClientIp } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ═══════════════════════════════════════════════════════════
// EAH — Merchant Business Image Upload
// logo / cover only; ownership is verified with the user session.
// business_media is the canonical logo/cover source; cover_image_url
// is synchronized for cards and legacy consumers.
// ═══════════════════════════════════════════════════════════

const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const ALLOWED_CATEGORIES = ['logo', 'cover'] as const
type Category = (typeof ALLOWED_CATEGORIES)[number]

async function discardUnpersistedImage(url: string): Promise<void> {
  try {
    const result = await deleteImage(url)
    if (!result.ok) {
      console.error('[image-upload] failed to remove unpersisted Cloudinary image:', result.error)
    }
  } catch (error) {
    console.error(
      '[image-upload] unexpected cleanup failure:',
      error instanceof Error ? error.message : 'Unknown error',
    )
  }
}

function jsonError(error: string, status: number) {
  return NextResponse.json({ ok: false, error }, { status })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.is_anonymous) return jsonError('Unauthorized', 401)

  const ip = await getClientIp()
  const rateLimit = await checkRateLimit(strictLimiter, `merchant-image:${user.id}:${ip}`, {
    failClosed: true,
  })
  if (!rateLimit.ok) {
    const unavailable = rateLimit.error.startsWith('تعذر')
    return NextResponse.json(
      { ok: false, error: rateLimit.error },
      {
        status: unavailable ? 503 : 429,
        headers: unavailable ? { 'Retry-After': '60' } : {},
      },
    )
  }

  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .select('id, slug')
    .eq('owner_profile_id', user.id)
    .limit(1)
    .maybeSingle()

  if (businessError) return jsonError('مش قادرين نتحقق من النشاط دلوقتي', 500)
  if (!business) return jsonError('مفيش نشاط مرتبط بحسابك', 403)

  const contentLength = Number(req.headers.get('content-length') ?? '0')
  if (Number.isFinite(contentLength) && contentLength > MAX_SIZE + 512 * 1024) {
    return jsonError('حجم الطلب أكبر من المسموح', 413)
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return jsonError('بيانات الرفع غير صحيحة', 400)
  }

  const file = formData.get('file')
  const category = String(formData.get('category') ?? '')

  if (!(file instanceof File)) return jsonError('مفيش ملف', 400)
  if (!ALLOWED_CATEGORIES.includes(category as Category)) {
    return jsonError('نوع الصورة غلط', 400)
  }
  if (!ALLOWED_TYPES.includes(file.type)) return jsonError('الصيغة مش مدعومة', 400)
  if (file.size <= 0 || file.size > MAX_SIZE) {
    return jsonError('الحجم لازم يكون أكبر من صفر وأقل من 5MB', 400)
  }

  // Resolve server credentials before uploading so a missing service-role key
  // does not leave an orphaned Cloudinary asset.
  let admin: ReturnType<typeof createServiceClient>
  try {
    admin = createServiceClient()
  } catch {
    return jsonError('رفع الصور غير متاح مؤقتًا', 503)
  }

  const folder = `eah/businesses/${business.id}/${category}`
  const upload = await uploadImage(file, folder, MAX_SIZE)
  if (!upload.ok) return jsonError(upload.error, 502)

  // The regular user client cannot write business_media under the current RLS
  // policies. Use the service client only after the user and ownership checks above.
  const { data: currentMedia, error: lookupError } = await admin
    .from('business_media')
    .select('id')
    .eq('business_id', business.id)
    .eq('media_type', category)
    .order('sort_order', { ascending: true })
    .limit(10)

  if (lookupError) {
    await discardUnpersistedImage(upload.url)
    return jsonError('تعذر تجهيز سجل الصورة، ولم يتم حفظ الصورة في النشاط', 500)
  }

  let mediaId: string
  const existing = currentMedia?.[0]

  if (existing) {
    const { error: updateMediaError } = await admin
      .from('business_media')
      .update({
        storage_path: upload.url,
        is_published: true,
        sort_order: 0,
      })
      .eq('id', existing.id)
      .select('id')
      .single()

    if (updateMediaError) {
      await discardUnpersistedImage(upload.url)
      return jsonError('تعذر حفظ الصورة في النشاط، وتم التراجع عن ملف الرفع', 500)
    }
    mediaId = existing.id

    const duplicateIds = (currentMedia ?? []).slice(1).map((item) => item.id)
    if (duplicateIds.length > 0) {
      const { error: cleanupError } = await admin
        .from('business_media')
        .delete()
        .in('id', duplicateIds)
      if (cleanupError) {
        await discardUnpersistedImage(upload.url)
        return jsonError('تعذر تنظيف سجلات الصور المكررة، ولم يتم حفظ الصورة الجديدة', 500)
      }
    }
  } else {
    const { data: inserted, error: insertError } = await admin
      .from('business_media')
      .insert({
        business_id: business.id,
        media_type: category,
        storage_path: upload.url,
        is_published: true,
        sort_order: 0,
      })
      .select('id')
      .single()

    if (insertError || !inserted) {
      await discardUnpersistedImage(upload.url)
      return jsonError('تعذر حفظ الصورة في النشاط، وتم التراجع عن ملف الرفع', 500)
    }
    mediaId = inserted.id
  }

  // The business_media AFTER trigger updates the legacy cover column atomically.
  // Refresh public cards and the business page after the canonical media row is saved.
  revalidatePath('/merchant/business')
  revalidatePath(`/businesses/${business.slug}`)
  revalidatePath('/explore')
  revalidateTag('businesses', 'default')

  return NextResponse.json({ ok: true, url: upload.url, mediaId, category })
}
