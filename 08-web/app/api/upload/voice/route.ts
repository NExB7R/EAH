import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'
export const maxDuration = 30

const MAX_SIZE = 5 * 1024 * 1024  // 5MB
const ALLOWED_TYPES = [
  'audio/webm', 'audio/ogg', 'audio/mp4',
  'audio/webm;codecs=opus', 'audio/ogg;codecs=opus',
  'audio/mpeg', 'audio/wav',
]

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
    return NextResponse.json({ ok: false, error: 'file_too_large', max: MAX_SIZE }, { status: 413 })
  }

  const type = file.type.toLowerCase()
  const isAllowed = ALLOWED_TYPES.some((t) => type.startsWith(t.split(';')[0]))
  if (!isAllowed) {
    return NextResponse.json({ ok: false, error: 'invalid_type', got: type }, { status: 400 })
  }

  const ext = type.includes('webm') ? 'webm'
    : type.includes('mp4') ? 'm4a'
    : type.includes('ogg') ? 'ogg'
    : type.includes('mpeg') ? 'mp3'
    : type.includes('wav') ? 'wav'
    : 'webm'

  const timestamp = Date.now()
  const path = `${user.id}/${timestamp}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { error: upErr } = await supabase.storage
    .from('voice')
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
      cacheControl: '3600',
    })

  if (upErr) {
    return NextResponse.json({ ok: false, error: upErr.message }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage.from('voice').getPublicUrl(path)

  return NextResponse.json({
    ok: true,
    url: publicUrl,
    path,
    size: file.size,
    duration_ms: null,  // يُحسب من المتصفح
  })
}
