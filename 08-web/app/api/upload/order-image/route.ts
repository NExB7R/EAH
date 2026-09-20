import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { uploadToCloudinary } from '@/lib/cloudinary'

export const runtime = 'nodejs'
export const maxDuration = 30

const MAX_SIZE = 8 * 1024 * 1024
const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic']

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ ok: false, error: 'no_file' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ ok: false, error: 'too_large', max: MAX_SIZE }, { status: 413 })
  }
  if (!ALLOWED.includes(file.type.toLowerCase())) {
    return NextResponse.json({ ok: false, error: 'invalid_type', got: file.type }, { status: 400 })
  }

  try {
    const result = await uploadToCloudinary(file, `orders/${user.id}`)
    return NextResponse.json({ ok: true, url: result.url })
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'upload_failed' },
      { status: 500 }
    )
  }
}
