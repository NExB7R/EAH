import 'server-only'
import { createPublicClient } from '@/lib/supabase/public'
import { createClient } from '@/lib/supabase/server'
import type { ToolDefinition } from './providers'

// ═══════════════════════════════════════════════════════════
// EAH — AI Tools
// ═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
// Input sanitization (أمان — ضد SQL wildcard injection)
// ═══════════════════════════════════════════════════════════

function sanitizeSearchInput(raw: unknown): string {
  if (typeof raw !== 'string') return ''
  return raw
    .replace(/[%_\\]/g, '') // شيل wildcards
    .replace(/[<>]/g, '') // شيل HTML
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80) // حد أقصى 80 حرف
}

function sanitizeSlug(raw: unknown): string {
  if (typeof raw !== 'string') return ''
  // slug: أحرف إنجليزية + أرقام + شرطة بس
  return raw.replace(/[^a-z0-9-]/gi, '').slice(0, 100)
}

export const TOOL_DEFS: ToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'search_businesses',
      description: 'ابحث عن أنشطة محلية (مطاعم، صيدليات، ماركت، توصيل) بالاسم أو النوع أو المنطقة',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'كلمة البحث — اسم أو نوع' },
          area: { type: 'string', description: 'المنطقة (اختياري)' },
          type: {
            type: 'string',
            enum: ['restaurant', 'pharmacy', 'delivery_office', 'misc'],
            description: 'نوع النشاط',
          },
          limit: { type: 'number', description: 'أقصى عدد نتائج (1-10)' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_business_details',
      description: 'هات تفاصيل نشاط معين بالـ slug (رابط الصفحة)',
      parameters: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'معرف النشاط في الرابط' },
        },
        required: ['slug'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_my_stats',
      description: 'هات إحصائيات المستخدم الحالي (نقاط، مفضلات، متابعات)',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_offers',
      description: 'هات العروض النشطة الحالية — لما المستخدم يسأل عن خصومات أو عروض',
      parameters: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'أقصى عدد نتائج (1-10)' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_trending',
      description:
        'هات الأنشطة الأكثر تفاعلاً (الترند) — لما المستخدم يسأل عن الأشهر أو الأكثر شعبية',
      parameters: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'أقصى عدد نتائج (1-10)' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_categories',
      description: 'هات أنواع الأنشطة المتاحة في المنصة + عدد كل نوع',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_businesses_by_area',
      description: 'هات كل الأنشطة في منطقة معينة',
      parameters: {
        type: 'object',
        properties: {
          area: { type: 'string', description: 'اسم المنطقة' },
          limit: { type: 'number', description: 'أقصى عدد نتائج (1-20)' },
        },
        required: ['area'],
      },
    },
  },
]

type SearchResult = {
  ok: boolean
  count?: number
  businesses?: {
    name: string
    slug: string
    type: string
    area: string | null
    hook: string | null
    is_open: boolean
    rating: number | null
    is_verified: boolean
    rating_count: number
    successful_orders: number
  }[]
  error?: string
}

async function toolSearchBusinesses(args: {
  query?: string
  area?: string
  type?: string
  limit?: number
}): Promise<SearchResult> {
  const supabase = createPublicClient()
  const limit = Math.min(Math.max(args.limit ?? 5, 1), 10)

  const query = sanitizeSearchInput(args.query)
  const area = sanitizeSearchInput(args.area)
  const type = sanitizeSearchInput(args.type)

  const VALID_TYPES = ['restaurant', 'pharmacy', 'delivery_office', 'misc']

  let q = supabase
    .from('businesses')
    .select('name, slug, business_type, area, hook, is_open, is_verified, rating_avg, rating_count, successful_orders')
    .eq('is_published', true)

  if (type && VALID_TYPES.includes(type)) {
    q = q.eq('business_type', type)
  }
  if (area) q = q.ilike('area', `%${area}%`)
  if (query) {
    const safe = query.replace(/,/g, ' ')
    q = q.or(`name.ilike.%${safe}%,hook.ilike.%${safe}%,description.ilike.%${safe}%`)
  }

  const { data, error } = await q
    .order('is_verified', { ascending: false })
    .order('rating_count', { ascending: false })
    .order('rating_avg', { ascending: false })
    .order('successful_orders', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[AI Tool] search error:', error.message)
    return { ok: false, error: 'حصلت مشكلة في البحث — جرب تاني' }
  }

  return {
    ok: true,
    count: data?.length ?? 0,
    businesses: (data ?? []).map((b) => ({
      name: b.name,
      slug: b.slug,
      type: b.business_type,
      area: b.area,
      hook: b.hook,
      is_open: b.is_open,
      rating: b.rating_count > 0 ? b.rating_avg : null,
      is_verified: b.is_verified,
      rating_count: b.rating_count,
      successful_orders: b.successful_orders,
    })),
  }
}

async function toolGetBusinessDetails(args: { slug: string }) {
  const slug = sanitizeSlug(args.slug)
  if (!slug) return { ok: false, error: 'معرف النشاط غير صحيح' }

  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('businesses')
    .select(
      'name, slug, business_type, description, hook, area, address_text, is_open, is_verified, rating_avg, rating_count, successful_orders, working_hours, accepts_whatsapp_orders',
    )
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle()

  if (error) {
    console.error('[AI Tool] details error:', error.message)
    return { ok: false, error: 'حصلت مشكلة — جرب تاني' }
  }
  if (!data) return { ok: false, error: 'النشاط مش موجود' }

  return {
    ok: true,
    business: {
      name: data.name,
      slug: data.slug,
      type: data.business_type,
      description: data.description,
      hook: data.hook,
      area: data.area,
      address: data.address_text,
      is_open: data.is_open,
      rating: data.rating_count > 0 ? data.rating_avg : null,
      rating_count: data.rating_count,
      is_verified: data.is_verified,
      successful_orders: data.successful_orders,
      accepts_whatsapp: data.accepts_whatsapp_orders,
      working_hours: data.working_hours,
    },
  }
}

async function toolGetMyStats(): Promise<{
  ok: boolean
  stats?: { points: number; favorites: number; follows: number; orders: number; participationPoints: number }
  error?: string
}> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'المستخدم مش مسجل دخول' }

  const [
    { data: pointsRow },
    { count: favorites },
    { count: follows },
    { count: orders },
    { data: profile },
  ] = await Promise.all([
    supabase
      .from('points_log')
      .select('balance_after')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase
      .from('business_follows')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id),
    supabase
      .from('order_requests')
      .select('*', { count: 'exact', head: true })
      .eq('customer_profile_id', user.id),
    supabase.from('profiles').select('trust_score').eq('id', user.id).maybeSingle(),
  ])

  return {
    ok: true,
    stats: {
      points: pointsRow?.balance_after ?? 0,
      favorites: favorites ?? 0,
      follows: follows ?? 0,
      orders: orders ?? 0,
      participationPoints: profile?.trust_score ?? 50,
    },
  }
}

// ─── Offers (العروض النشطة) ───

async function toolGetOffers(args: { limit?: number }) {
  const supabase = createPublicClient()
  const limit = Math.min(Math.max(args.limit ?? 8, 1), 10)
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('offers')
    .select(
      `
      id, title, price,
      business:businesses(slug, name, area)
    `,
    )
    .eq('is_published', true)
    .or(`ends_at.is.null,ends_at.gt.${now}`)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[AI Tool] offers error:', error.message)
    return { ok: false, error: 'حصلت مشكلة — جرب تاني' }
  }

  return {
    ok: true,
    count: data?.length ?? 0,
    offers: (data ?? []).map((o) => {
      const biz = o.business as unknown as
        { slug: string; name: string; area: string | null }[] | null
      const single = Array.isArray(biz) ? (biz[0] ?? null) : biz
      return {
        title: o.title,
        price: o.price,
        business_name: single?.name ?? null,
        business_slug: single?.slug ?? null,
        area: single?.area ?? null,
      }
    }),
  }
}

// ─── Trending (الأكثر تفاعلاً) ───

async function toolGetTrending(args: { limit?: number }) {
  const supabase = createPublicClient()
  const limit = Math.min(Math.max(args.limit ?? 8, 1), 10)

  const { data, error } = await supabase
    .from('businesses')
    .select('name, slug, business_type, area, rating_avg, rating_count, is_verified, successful_orders, velocity_score, engagement_score')
    .eq('is_published', true)
    .order('velocity_score', { ascending: false })
    .order('engagement_score', { ascending: false })
    .order('successful_orders', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[AI Tool] trending error:', error.message)
    return { ok: false, error: 'حصلت مشكلة — جرب تاني' }
  }

  return {
    ok: true,
    count: data?.length ?? 0,
    businesses: (data ?? []).map((b, i) => ({
      rank: i + 1,
      name: b.name,
      slug: b.slug,
      type: b.business_type,
      area: b.area,
      rating: b.rating_count > 0 ? b.rating_avg : null,
      is_verified: b.is_verified,
      rating_count: b.rating_count,
      successful_orders: b.successful_orders,
    })),
  }
}

// ─── Categories (أنواع الأنشطة) ───

async function toolGetCategories() {
  const supabase = createPublicClient()

  const { data, error } = await supabase
    .from('businesses')
    .select('business_type')
    .eq('is_published', true)

  if (error) {
    console.error('[AI Tool] categories error:', error.message)
    return { ok: false, error: 'حصلت مشكلة — جرب تاني' }
  }

  const TYPE_LABEL: Record<string, string> = {
    restaurant: 'مطاعم',
    pharmacy: 'صيدليات',
    supermarket: 'ماركت',
    delivery_office: 'توصيل',
    misc: 'أنشطة أخرى',
  }

  const counts = new Map<string, number>()
  for (const b of data ?? []) {
    counts.set(b.business_type, (counts.get(b.business_type) ?? 0) + 1)
  }

  return {
    ok: true,
    total: data?.length ?? 0,
    categories: Array.from(counts.entries()).map(([type, count]) => ({
      type,
      label: TYPE_LABEL[type] ?? type,
      count,
    })),
  }
}

// ─── Businesses by Area ───

async function toolGetBusinessesByArea(args: { area: string; limit?: number }) {
  const area = sanitizeSearchInput(args.area)
  if (!area) return { ok: false, error: 'اكتب اسم المنطقة' }

  const supabase = createPublicClient()
  const limit = Math.min(Math.max(args.limit ?? 10, 1), 20)

  const { data, error } = await supabase
    .from('businesses')
    .select('name, slug, business_type, area, rating_avg, rating_count, is_open, is_verified, successful_orders')
    .eq('is_published', true)
    .ilike('area', `%${area}%`)
    .order('is_verified', { ascending: false })
    .order('rating_count', { ascending: false })
    .order('rating_avg', { ascending: false })
    .order('successful_orders', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[AI Tool] by area error:', error.message)
    return { ok: false, error: 'حصلت مشكلة — جرب تاني' }
  }

  return {
    ok: true,
    count: data?.length ?? 0,
    area,
    businesses: (data ?? []).map((b) => ({
      name: b.name,
      slug: b.slug,
      type: b.business_type,
      area: b.area,
      is_open: b.is_open,
      rating: b.rating_count > 0 ? b.rating_avg : null,
      is_verified: b.is_verified,
      rating_count: b.rating_count,
      successful_orders: b.successful_orders,
    })),
  }
}

export async function executeTool(name: string, argsJson: string): Promise<unknown> {
  let args: Record<string, unknown> = {}
  try {
    args = argsJson ? JSON.parse(argsJson) : {}
  } catch {
    return { ok: false, error: 'arguments مش JSON صحيح' }
  }

  switch (name) {
    case 'search_businesses':
      return toolSearchBusinesses(args as Parameters<typeof toolSearchBusinesses>[0])
    case 'get_business_details':
      return toolGetBusinessDetails(args as { slug: string })
    case 'get_my_stats':
      return toolGetMyStats()
    case 'get_offers':
      return toolGetOffers(args as { limit?: number })
    case 'get_trending':
      return toolGetTrending(args as { limit?: number })
    case 'get_categories':
      return toolGetCategories()
    case 'get_businesses_by_area':
      return toolGetBusinessesByArea(args as { area: string; limit?: number })
    default:
      return { ok: false, error: `أداة غير معروفة: ${name}` }
  }
}
