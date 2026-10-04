import 'server-only'
import { createPublicClient } from '@/lib/supabase/public'
import { createClient } from '@/lib/supabase/server'
import type { ToolDefinition } from './openrouter'

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
            enum: ['restaurant', 'pharmacy', 'supermarket', 'delivery_office', 'misc'],
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
    trust_tier: string
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

  const VALID_TYPES = ['restaurant', 'pharmacy', 'supermarket', 'delivery_office', 'misc']

  let q = supabase
    .from('businesses')
    .select('name, slug, business_type, area, hook, is_open, rating_avg, rating_count, trust_tier')
    .eq('is_published', true)

  if (type && VALID_TYPES.includes(type)) {
    q = q.eq('business_type', type)
  }
  if (area) q = q.ilike('area', `%${area}%`)
  if (query) {
    const safe = query.replace(/,/g, ' ')
    q = q.or(`name.ilike.%${safe}%,hook.ilike.%${safe}%,description.ilike.%${safe}%`)
  }

  const { data, error } = await q.order('trust_score', { ascending: false }).limit(limit)

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
      trust_tier: b.trust_tier,
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
      'name, slug, business_type, description, hook, area, address_text, is_open, rating_avg, rating_count, trust_tier, working_hours, accepts_whatsapp_orders',
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
      trust_tier: data.trust_tier,
      accepts_whatsapp: data.accepts_whatsapp_orders,
      working_hours: data.working_hours,
    },
  }
}

async function toolGetMyStats(): Promise<{
  ok: boolean
  stats?: { points: number; favorites: number; follows: number; orders: number; impact: number }
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
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase
      .from('order_requests')
      .select('*', { count: 'exact', head: true })
      .eq('customer_profile_id', user.id),
    supabase.from('profiles').select('impact_score').eq('id', user.id).maybeSingle(),
  ])

  return {
    ok: true,
    stats: {
      points: pointsRow?.balance_after ?? 0,
      favorites: favorites ?? 0,
      follows: follows ?? 0,
      orders: orders ?? 0,
      impact: profile?.impact_score ?? 0,
    },
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
    default:
      return { ok: false, error: `أداة غير معروفة: ${name}` }
  }
}
