import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { checkRateLimit, getClientIp, strictLimiter } from '@/lib/rate-limit'

// EAH — Find by Phone. Authenticated users only; return a minimal public profile.
const EGYPT_PHONE_REGEX = /^01[0125][0-9]{8}$/

// Keep personal profile responses out of browser and intermediary caches.
function jsonNoStore(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers)
  headers.set('Cache-Control', 'no-store')
  return NextResponse.json(body, { ...init, headers })
}

export async function POST(request: NextRequest) {
  // Apply the limit before authentication so unauthenticated probes are limited too.
  const ip = await getClientIp()
  const rl = await checkRateLimit(strictLimiter, `find:${ip}`, true)
  if (!rl.ok) {
    return jsonNoStore(
      { error: rl.error },
      {
        status: rl.unavailable ? 503 : 429,
        headers: { 'Retry-After': String(Math.max(1, rl.retryAfter)) },
      },
    )
  }

  const body: unknown = await request.json().catch(() => null)
  const phone =
    typeof body === 'object' && body !== null && 'phone' in body && typeof body.phone === 'string'
      ? body.phone.trim()
      : ''

  if (!phone) {
    return jsonNoStore({ error: 'الرقم فاضي' }, { status: 400 })
  }

  if (phone.length !== 11 || !EGYPT_PHONE_REGEX.test(phone)) {
    return jsonNoStore(
      {
        error: 'الرقم مش صح — لازم يبدأ بـ 010/011/012/015 ويتكوّن من 11 رقم',
        status: 'invalid',
      },
      { status: 400 },
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return jsonNoStore({ error: 'سجّل دخولك الأول عشان تبحث عن رقم' }, { status: 401 })
  }

  // Add a per-account cap so changing IPs cannot cheaply enumerate phone numbers.
  const userRl = await checkRateLimit(strictLimiter, `find-user:${user.id}`, true)
  if (!userRl.ok) {
    return jsonNoStore(
      { error: userRl.error },
      {
        status: userRl.unavailable ? 503 : 429,
        headers: { 'Retry-After': String(Math.max(1, userRl.retryAfter)) },
      },
    )
  }

  const serviceClient = createServiceClient()
  const { data, error } = await serviceClient.rpc('find_by_phone', { p_phone: phone })

  if (error) {
    console.error('[Find by Phone]', error.message)
    return jsonNoStore({ error: 'حصل خطأ في البحث' }, { status: 500 })
  }

  const result = Array.isArray(data) && data.length > 0 ? data[0] : null

  if (!result) {
    return jsonNoStore({ found: false, message: 'الرقم مش مسجل في EAH' })
  }

  // Never forward arbitrary RPC columns to the browser.
  return jsonNoStore({
    found: true,
    user: {
      user_id: result.user_id,
      display_name: result.display_name,
      alias: result.alias,
      avatar_url: result.avatar_url,
      trust_score: result.trust_score,
      trust_tier: result.trust_tier,
      legend_points: result.legend_points,
      is_premium: result.is_premium,
      is_business: result.is_business,
      business_slug: result.business_slug,
      business_name: result.business_name,
      member_since: result.member_since,
    },
  })
}
