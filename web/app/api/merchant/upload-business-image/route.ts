import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { uploadImage } from '@/lib/cloudinary'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ═══════════════════════════════════════════════════════════
// EAH — Merchant Business Image Upload
// logo / cover فقط — يتحقق من ملكية النشاط
// ═══════════════════════════════════════════════════════════

const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const ALLOWED_CATEGORIES = ['logo', 'cover'] as const
type Category = (typeof ALLOWED_CATEGORIES)[number]

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: biz } = await supabase
    .from('businesses')
    .select('id, slug')
    .eq('owner_profile_id', user.id)
    .limit(1)
    .maybeSingle()

  if (!biz) {
    return NextResponse.json({ error: 'مفيش نشاط مرتبط' }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get('file')
  const category = String(formData.get('category') ?? '')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'مفيش ملف' }, { status: 400 })
  }
  if (!ALLOWED_CATEGORIES.includes(category as Category)) {
    return NextResponse.json({ error: 'نوع الصورة غلط' }, { status: 400 })
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'الصيغة مش مدعومة' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'الحجم أكبر من 5MB' }, { status: 400 })
  }

  const folder = `eah/businesses/${biz.id}/${category}`
  const result = await uploadImage(file, folder, MAX_SIZE)

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  const field = category === 'logo' ? 'logo_url' : 'cover_image_url'
  await supabase
    .from('businesses')
    .update({ [field]: result.url })
    .eq('id', biz.id)

  return NextResponse.json({ ok: true, url: result.url })
}
