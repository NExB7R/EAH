import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const VALID_TYPES = ['restaurant', 'pharmacy', 'supermarket', 'delivery_office'] as const

const ReviewSchema = z.object({
  author: z.string().trim().min(1).max(80),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(5).max(500),
})

const Schema = z.object({
  name: z.string().trim().min(2).max(120),
  type: z.enum(VALID_TYPES),
  area: z.string().trim().min(2).max(80),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  whatsapp: z.string().trim().max(40).optional().or(z.literal('')),
  facebook: z.string().trim().max(500).optional().or(z.literal('')),
  website: z.string().trim().max(500).optional().or(z.literal('')),
  instagram: z.string().trim().max(500).optional().or(z.literal('')),
  sourceUrl: z.string().trim().max(500).optional().or(z.literal('')),
  description: z.string().trim().max(1000).optional().or(z.literal('')),
  imageUrl: z.string().trim().max(500).optional().or(z.literal('')),
  address: z.string().trim().max(200).optional().or(z.literal('')),
  hours: z.string().trim().max(200).optional().or(z.literal('')),
  hasDelivery: z.boolean().optional(),
  reviews: z.array(ReviewSchema).max(20).optional(),
})

// كلمات ممنوعة — منع المسيء
const BANNED_WORDS = [
  'سيء', 'زفت', 'وسخ', 'قذر', 'كره', 'بضان', 'عرص', 'خول',
  'حمار', 'كلب', 'حقير', 'تافه', 'فاشل', 'نصاب', 'حرامي',
  'خرا', 'زبالة', 'مقرف', 'قرف', 'مش نضيف'
]

function isReviewSafe(text: string): boolean {
  const t = text.toLowerCase()
  return !BANNED_WORDS.some((w) => t.includes(w))
}

function slugify(name: string): string {
  const s = name.toLowerCase().trim()
    .replace(/[^\w\s\u0600-\u06FF-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
  return s || 'business'
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return NextResponse.json({ ok: false }, { status: 401 })

  const { data: role } = await supabase
    .from('user_roles').select('role').eq('user_id', userData.user.id).maybeSingle()
  if (role?.role !== 'super_admin') return NextResponse.json({ ok: false }, { status: 403 })

  const body = await request.json().catch(() => null)
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid', issues: parsed.error.issues }, { status: 400 })
  }
  const d = parsed.data

  // فلترة المراجعات المسيئة
  const safeReviews = (d.reviews || []).filter(
    (r) => isReviewSafe(r.comment) && isReviewSafe(r.author)
  )

  // Unique slug
  let slug = slugify(d.name)
  let attempt = 0
  while (attempt < 30) {
    const { data: exist } = await supabase.from('businesses').select('id').eq('slug', slug).maybeSingle()
    if (!exist) break
    attempt++
    slug = slugify(d.name) + '-' + attempt
  }
  if (attempt >= 30) return NextResponse.json({ ok: false, error: 'slug_conflict' }, { status: 409 })

  // working_hours: بسيط من الساعات المستخرجة
  const workingHours: any = {}
  if (d.hours) {
    workingHours.note = d.hours
  }

  const { data: created, error } = await supabase
    .from('businesses')
    .insert({
      name: d.name,
      slug,
      business_type: d.type,
      area: d.area,
      city: d.area,
      hook: d.description ? d.description.slice(0, 80) : null,
      description: d.description || null,
      address_text: d.address || null,
      map_url: null,
      cover_image_url: d.imageUrl || null,
      is_published: true,
      is_featured: false,
      is_open: true,
      working_hours: workingHours,
    })
    .select('id,slug')
    .single()

  if (error || !created) {
    return NextResponse.json({ ok: false, error: error?.message || 'insert_failed' }, { status: 500 })
  }

  // Contacts
  const contacts: any[] = []
  if (d.phone) {
    contacts.push({ business_id: created.id, method_type: 'phone', value: d.phone, is_primary: true, is_public: true })
  }
  if (d.whatsapp) {
    const digits = d.whatsapp.replace(/\D/g, '')
    const wa = digits.startsWith('0') ? '2' + digits : digits
    contacts.push({ business_id: created.id, method_type: 'whatsapp', value: wa, is_primary: false, is_public: true })
  }
  if (d.facebook) {
    const fbUrl = d.facebook.startsWith('http')
      ? d.facebook
      : 'https://facebook.com/' + d.facebook.replace(/^[/]+/, '')
    contacts.push({ business_id: created.id, method_type: 'facebook', value: fbUrl, is_primary: false, is_public: true })
  }
  if (d.instagram) {
    const igUrl = d.instagram.startsWith('http')
      ? d.instagram
      : 'https://instagram.com/' + d.instagram.replace(/^[/]+/, '')
    contacts.push({ business_id: created.id, method_type: 'instagram', value: igUrl, is_primary: false, is_public: true })
  }
  if (d.website) {
    contacts.push({ business_id: created.id, method_type: 'website', value: d.website, is_primary: false, is_public: true })
  }
  if (!d.facebook && !d.website && d.sourceUrl) {
    const isFb = d.sourceUrl.includes('facebook.com') || d.sourceUrl.includes('fb.com')
    const isIg = d.sourceUrl.includes('instagram.com')
    if (isFb) contacts.push({ business_id: created.id, method_type: 'facebook', value: d.sourceUrl, is_primary: false, is_public: true })
    else if (isIg) contacts.push({ business_id: created.id, method_type: 'instagram', value: d.sourceUrl, is_primary: false, is_public: true })
    else contacts.push({ business_id: created.id, method_type: 'website', value: d.sourceUrl, is_primary: false, is_public: true })
  }
  if (contacts.length > 0) {
    await supabase.from('business_contact_methods').insert(contacts)
  }

  // Cover image
  if (d.imageUrl) {
    await supabase.from('business_media').insert({
      business_id: created.id,
      media_type: 'gallery',
      storage_path: d.imageUrl,
      alt_text: d.name + ' - صورة',
      sort_order: 0,
      is_published: true,
    })
  }

  // Reviews
  let reviewsInserted = 0
  if (safeReviews.length > 0) {
    const reviewRows = safeReviews.map((r) => ({
      business_id: created.id,
      user_id: userData.user.id,
      rating: r.rating,
      taste_rating: r.rating,
      value_rating: r.rating,
      speed_rating: r.rating,
      experience_rating: r.rating,
      comment: r.comment,
      status: 'approved',
      source: 'facebook',
    }))
    const { error: revErr } = await supabase.from('business_reviews').insert(reviewRows)
    if (!revErr) reviewsInserted = reviewRows.length
  }

  return NextResponse.json({
    ok: true,
    slug: created.slug,
    id: created.id,
    reviewsInserted,
  })
}
