import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { checkRateDb } from '@/lib/security/rate-limit'

const MAX_SIZE = 10 * 1024 * 1024
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
const BUSINESS_FOLDER = /^biz-([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})\/(logo|cover|gallery|menu|offers)$/i
const NEW_FOLDER = /^new-\d{10,14}\/(logo|cover|gallery|menu)$/

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: roleRow } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()

    const role = roleRow?.role
    if (role !== 'super_admin' && role !== 'merchant') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const rate = await checkRateDb(`business-upload:${user.id}`, 40, 60 * 60 * 1000)
    if (!rate.ok) return NextResponse.json({ error: 'جرّب تاني بعد شوية' }, { status: 429 })

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = String(formData.get('folder') ?? '')
    const businessMatch = folder.match(BUSINESS_FOLDER)
    const isNewFolder = NEW_FOLDER.test(folder)

    if (!businessMatch && !(role === 'super_admin' && isNewFolder)) {
      return NextResponse.json({ error: 'Invalid upload folder' }, { status: 403 })
    }

    if (role === 'merchant') {
      const businessId = businessMatch?.[1]
      if (!businessId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

      const { data: ownedBusiness } = await supabase
        .from('businesses')
        .select('id')
        .eq('id', businessId)
        .eq('owner_profile_id', user.id)
        .maybeSingle()
      if (!ownedBusiness) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
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
    console.error('[admin/upload] failed', error instanceof Error ? error.name : 'unknown')
    return NextResponse.json({ error: 'تعذر رفع الصورة' }, { status: 500 })
  }
}
