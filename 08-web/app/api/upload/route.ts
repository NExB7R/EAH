import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { uploadToCloudinary } from '@/lib/cloudinary'

const MAX_SIZE = 10 * 1024 * 1024
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = String(formData.get('folder') ?? 'misc')

    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
    if (file.size > MAX_SIZE) return NextResponse.json({ error: 'حجم الصورة أكبر من 10MB' }, { status: 400 })
    if (!ALLOWED_MIME.includes(file.type)) return NextResponse.json({ error: 'نوع الصورة مش مدعوم' }, { status: 400 })

    const result = await uploadToCloudinary(file, folder)

    return NextResponse.json({
      ok: true,
      url: result.url,
      publicId: result.publicId,
      bytes: result.bytes,
      format: result.format,
    })
  } catch (e) {
    console.error('[upload] error:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unexpected error' },
      { status: 500 }
    )
  }
}
