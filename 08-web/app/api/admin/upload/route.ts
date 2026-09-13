import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

const ALLOWED_BUCKETS = ['business-media', 'business-menu', 'business-offers'] as const
const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // 1. نتأكد إن المستخدم أدمن
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: roleRow } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id)
      .maybeSingle()

    if (roleRow?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 2. نقرأ الفورم
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const bucket = String(formData.get('bucket') ?? '')
    const folder = String(formData.get('folder') ?? 'general')

    if (!file) {
      return NextResponse.json({ error: 'No file' }, { status: 400 })
    }

    if (!ALLOWED_BUCKETS.includes(bucket as any)) {
      return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'حجم الصورة أكبر من 5MB' }, { status: 400 })
    }

    if (!ALLOWED_MIME.includes(file.type)) {
      return NextResponse.json({ error: 'نوع الصورة مش مدعوم' }, { status: 400 })
    }

    // 3. ننظّف الاسم
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const path = `${folder}/${safeName}`

    // 4. نرفع
    const arrayBuffer = await file.arrayBuffer()
    const { error: upErr } = await supabase.storage
      .from(bucket)
      .upload(path, arrayBuffer, {
        contentType: file.type,
        cacheControl: '31536000',
        upsert: false,
      })

    if (upErr) {
      return NextResponse.json({ error: upErr.message }, { status: 500 })
    }

    // 5. ناخد الرابط العام
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)

    return NextResponse.json({
      ok: true,
      path,
      url: urlData.publicUrl,
      bucket,
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unexpected error' },
      { status: 500 }
    )
  }
}
