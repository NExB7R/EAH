import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { checkRateDb } from '@/lib/security/rate-limit'

const MAX_SIZE = 10 * 1024 * 1024
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const rate = await checkRateDb(`avatar-upload:${user.id}`, 12, 60 * 60 * 1000)
    if (!rate.ok) return NextResponse.json({ error: 'جرّب تاني بعد شوية' }, { status: 429 })

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = String(formData.get('folder') ?? '')

    // This public authenticated endpoint is only for the caller's avatar.
    // Business assets use /api/admin/upload with ownership checks.
    if (folder !== `avatars/${user.id}`) {
      return NextResponse.json({ error: 'Invalid upload folder' }, { status: 403 })
    }
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
    if (file.size > MAX_SIZE) return NextResponse.json({ error: 'حجم الصورة أكبر من 10MB' }, { status: 413 })
    if (!ALLOWED_MIME.includes(file.type.toLowerCase())) {
      return NextResponse.json({ error: 'نوع الصورة مش مدعوم' }, { status: 400 })
    }

    const result = await uploadToCloudinary(file, folder)
    return NextResponse.json({
      ok: true,
      url: result.url,
      publicId: result.publicId,
      bytes: result.bytes,
      format: result.format,
    })
  } catch (error) {
    console.error('[upload] failed', error instanceof Error ? error.name : 'unknown')
    return NextResponse.json({ error: 'تعذر رفع الصورة' }, { status: 500 })
  }
}
