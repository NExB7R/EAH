import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { strictLimiter, checkRateLimit } from '@/lib/rate-limit'

// ═══════════════════════════════════════════════════════════════════
// Customer order attachment upload
// - image: max 5MB, image/*
// - voice: max 5MB, audio/*, max 60s (client sends duration)
// Uses Cloudinary (already configured for avatars/business images).
// ═══════════════════════════════════════════════════════════════════

const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED_IMAGE = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
const ALLOWED_AUDIO = ['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/mpeg', 'audio/m4a']

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET

async function cloudinaryUpload(
  file: File,
  resourceType: 'image' | 'video',
): Promise<{ url: string; duration?: number } | { error: string }> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) return { error: 'Cloudinary مش مضبوط' }

  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', UPLOAD_PRESET)
  fd.append('folder', 'eah/orders')

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`
  try {
    const res = await fetch(url, { method: 'POST', body: fd })
    const data = (await res.json()) as {
      secure_url?: string
      error?: { message?: string }
      duration?: number
    }
    if (!res.ok || !data.secure_url) {
      return { error: data.error?.message ?? 'فشل الرفع' }
    }
    if (resourceType === 'video') {
      if (typeof data.duration !== 'number' || !Number.isFinite(data.duration) || data.duration <= 0) {
        return { error: 'تعذر التحقق من مدة الصوت' }
      }
      if (data.duration > 60) return { error: 'الصوت لازم يكون 60 ثانية أو أقل' }
    }
    return { url: data.secure_url, duration: data.duration }
  } catch {
    return { error: 'فشل الاتصال بـ Cloudinary' }
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: false, error: 'لازم تسجل دخول' }, { status: 401 })

  const rl = await checkRateLimit(strictLimiter, `order-upload:${user.id}`, {
    failClosed: true,
  })
  if (!rl.ok) {
    return NextResponse.json({ ok: false, error: rl.error }, { status: 429 })
  }

  const contentLength = Number(req.headers.get('content-length') ?? '0')
  if (Number.isFinite(contentLength) && contentLength > MAX_SIZE + 1024 * 1024) {
    return NextResponse.json({ ok: false, error: 'الحجم كبير (5MB max)' }, { status: 413 })
  }

  const formData = await req.formData()
  const file = formData.get('file')
  const kind = String(formData.get('kind') ?? 'image')

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: 'ملف مفقود' }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ ok: false, error: 'الحجم كبير (5MB max)' }, { status: 413 })
  }

  const mime = file.type
  const isImage = kind === 'image' && ALLOWED_IMAGE.includes(mime)
  const isVoice = kind === 'voice' && ALLOWED_AUDIO.includes(mime)

  if (!isImage && !isVoice) {
    return NextResponse.json({ ok: false, error: 'نوع الملف مش مدعوم' }, { status: 415 })
  }

  // Voice → Cloudinary "video" resource type
  const resourceType: 'image' | 'video' = isVoice ? 'video' : 'image'
  const res = await cloudinaryUpload(file, resourceType)

  if ('error' in res) {
    return NextResponse.json({ ok: false, error: res.error }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    url: res.url,
    size: file.size,
    mime,
    kind,
    duration_sec: res.duration,
  })
}
