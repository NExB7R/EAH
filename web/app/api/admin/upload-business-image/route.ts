import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { uploadImage } from '@/lib/cloudinary'
import { strictLimiter, checkRateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ═══════════════════════════════════════════════════════════
// EAH — Admin Business Image Upload
// Cloudinary: logo / cover / gallery
// ═══════════════════════════════════════════════════════════

const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const ALLOWED_CATEGORIES = ['logo', 'cover', 'gallery'] as const
type Category = (typeof ALLOWED_CATEGORIES)[number]

export async function POST(req: NextRequest) {
  const ctx = await requireAdmin()
  if (!ctx.ok) {
    return NextResponse.json({ error: 'مفيش صلاحية' }, { status: 403 })
  }

  const rl = await checkRateLimit(strictLimiter, `biz-upload:${ctx.userId}`)
  if (!rl.ok) {
    return NextResponse.json({ error: rl.error }, { status: 429 })
  }

  const formData = await req.formData()
  const file = formData.get('file')
  const category = String(formData.get('category') ?? '')
  const businessId = String(formData.get('businessId') ?? '')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'مفيش ملف' }, { status: 400 })
  }
  if (!ALLOWED_CATEGORIES.includes(category as Category)) {
    return NextResponse.json({ error: 'نوع الصورة غلط' }, { status: 400 })
  }
  if (!businessId || !/^[0-9a-f-]{36}$/.test(businessId)) {
    return NextResponse.json({ error: 'معرّف النشاط غلط' }, { status: 400 })
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'الصيغة مش مدعومة' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'الحجم أكبر من 5MB' }, { status: 400 })
  }

  const folder = `eah/businesses/${businessId}/${category}`
  const result = await uploadImage(file, folder, MAX_SIZE)

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  if (category === 'logo' || category === 'cover') {
    const field = category === 'logo' ? 'logo_url' : 'cover_image_url'
    await ctx.supabase
      .from('businesses')
      .update({ [field]: result.url })
      .eq('id', businessId)
  }

  return NextResponse.json({ ok: true, url: result.url })
}
