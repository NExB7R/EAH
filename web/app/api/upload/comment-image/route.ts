import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { uploadImage } from '@/lib/cloudinary'
import { strictLimiter, checkRateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || user.is_anonymous) {
    return NextResponse.json({ error: 'لازم تسجل دخول' }, { status: 401 })
  }

  const rl = await checkRateLimit(strictLimiter, `upload:${user.id}`, { failClosed: true })
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
  if (Number.isFinite(contentLength) && contentLength > 5.2 * 1024 * 1024) {
    return NextResponse.json({ error: 'حجم الطلب أكبر من المسموح' }, { status: 413 })
  }

  const formData = await req.formData().catch(() => null)
  if (!formData) return NextResponse.json({ error: 'بيانات الملف غير صحيحة' }, { status: 400 })
  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'مفيش ملف' }, { status: 400 })
  }

  const result = await uploadImage(file, `eah/comments/${user.id}`)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ url: result.url })
}
