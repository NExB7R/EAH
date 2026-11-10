import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { uploadImage, deleteImage } from '@/lib/cloudinary'
import { strictLimiter, checkRateLimit } from '@/lib/rate-limit'
import { revalidatePath } from 'next/cache'
import { logUserEvent } from '@/lib/audit/user-event'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ═══════════════════════════════════════════════════════════
// EAH — Avatar Upload API
// ═══════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.is_anonymous) {
    return NextResponse.json({ error: 'لازم تسجل دخول' }, { status: 401 })
  }

  const rl = await checkRateLimit(strictLimiter, `avatar:${user.id}`, { failClosed: true })
  if (!rl.ok) {
    const unavailable = rl.error.startsWith('تعذر')
    return NextResponse.json(
      { error: rl.error },
      {
        status: unavailable ? 503 : 429,
        headers: unavailable ? { 'Retry-After': '60' } : {},
      },
    )
  }

  const contentLength = Number(req.headers.get('content-length') ?? '0')
  if (Number.isFinite(contentLength) && contentLength > 3.2 * 1024 * 1024) {
    return NextResponse.json({ error: 'حجم الطلب أكبر من المسموح' }, { status: 413 })
  }

  const formData = await req.formData().catch(() => null)
  if (!formData) return NextResponse.json({ error: 'بيانات الملف غير صحيحة' }, { status: 400 })
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'مفيش ملف' }, { status: 400 })
  }

  // Validation
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'الملف مش صورة' }, { status: 400 })
  }

  if (file.size > 3 * 1024 * 1024) {
    return NextResponse.json({ error: 'حجم الصورة أكبر من 3MB' }, { status: 400 })
  }

  // رفع لـ Cloudinary
  const result = await uploadImage(file, `eah/avatars/${user.id}`, 3 * 1024 * 1024)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  // تحديث DB
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: result.url })
    .eq('id', user.id)

  if (updateError) {
    return NextResponse.json({ error: 'فشل تحديث الصورة' }, { status: 500 })
  }

  revalidatePath('/account')
  revalidatePath('/account/edit')
  revalidatePath('/admin/profile')
  revalidatePath('/', 'layout')
  await logUserEvent({
    userId: user.id,
    action: 'profile.avatar_upload',
    metadata: { url: result.url },
  })
  return NextResponse.json({ ok: true, url: result.url })
}

// ═══════════════════════════════════════════════════════════
// EAH — Avatar Delete (Cloudinary destroy + DB clear)
// ═══════════════════════════════════════════════════════════
export async function DELETE() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || user.is_anonymous)
    return NextResponse.json({ error: 'لازم تسجل دخول' }, { status: 401 })

  const rl = await checkRateLimit(strictLimiter, `avatar-del:${user.id}`, { failClosed: true })
  if (!rl.ok)
    return NextResponse.json(
      { error: rl.error },
      { status: rl.error.startsWith('تعذر') ? 503 : 429 },
    )

  const { data: profile, error: readError } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('id', user.id)
    .maybeSingle()
  if (readError) return NextResponse.json({ error: 'تعذر قراءة البيانات' }, { status: 500 })

  const currentUrl = (profile?.avatar_url as string | null) ?? null
  if (currentUrl) {
    const del = await deleteImage(currentUrl)
    if (!del.ok) return NextResponse.json({ error: del.error }, { status: 400 })
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: null })
    .eq('id', user.id)
  if (updateError) return NextResponse.json({ error: 'فشل تحديث البيانات' }, { status: 500 })

  revalidatePath('/account')
  revalidatePath('/account/edit')
  revalidatePath('/admin/profile')
  revalidatePath('/', 'layout')
  await logUserEvent({
    userId: user.id,
    action: 'profile.avatar_delete',
    metadata: currentUrl ? { deleted_url: currentUrl } : {},
  })
  return NextResponse.json({ ok: true })
}
