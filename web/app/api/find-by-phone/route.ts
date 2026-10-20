import { NextResponse, type NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { strictLimiter, checkRateLimit, getClientIp } from '@/lib/rate-limit'

// ═══════════════════════════════════════════════════════════
// EAH — Find by Phone (Truecaller Style)
// ═══════════════════════════════════════════════════════════

const EGYPT_PHONE_REGEX = /^01[0125][0-9]{8}$/
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

type TurnstileResult = { ok: true } | { ok: false; unavailable: boolean }

async function verifyTurnstile(token: string): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY

  // Local development may omit credentials. Production must always use a real secret.
  if (process.env.NODE_ENV !== 'production' && (!secret || secret.startsWith('1x000'))) {
    return { ok: true }
  }
  if (!secret || secret.startsWith('1x000')) {
    return { ok: false, unavailable: true }
  }

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token }),
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) return { ok: false, unavailable: true }
    const result = (await response.json()) as { success?: boolean }
    return result.success === true
      ? { ok: true }
      : { ok: false, unavailable: false }
  } catch {
    return { ok: false, unavailable: true }
  }
}

export async function POST(request: NextRequest) {
  // Phone lookup can be used for enumeration, so throttle it strictly and fail closed
  // if the shared rate-limit provider is unavailable.
  const ip = await getClientIp()
  const rateLimit = await checkRateLimit(strictLimiter, `find:${ip}`, { failClosed: true })
  if (!rateLimit.ok) {
    const unavailable = rateLimit.error.startsWith('تعذر')
    return NextResponse.json(
      { error: rateLimit.error },
      {
        status: unavailable ? 503 : 429,
        headers: unavailable ? { 'Retry-After': '60' } : {},
      },
    )
  }

  const body: unknown = await request.json().catch(() => null)
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'بيانات الطلب غير صحيحة' }, { status: 400 })
  }

  const payload = body as Record<string, unknown>
  const phone = typeof payload.phone === 'string' ? payload.phone.trim() : ''
  const turnstileToken =
    typeof payload.turnstileToken === 'string' ? payload.turnstileToken.trim() : ''

  if (!phone) {
    return NextResponse.json({ error: 'الرقم فاضي' }, { status: 400 })
  }

  if (!EGYPT_PHONE_REGEX.test(phone)) {
    return NextResponse.json(
      { error: 'الرقم مش صح — لازم يبدأ بـ 010/011/012/015', status: 'invalid' },
      { status: 400 },
    )
  }

  if (!turnstileToken) {
    return NextResponse.json({ error: 'أكمل التحقق الأمني من فضلك' }, { status: 400 })
  }

  const captcha = await verifyTurnstile(turnstileToken)
  if (!captcha.ok) {
    return NextResponse.json(
      {
        error: captcha.unavailable
          ? 'البحث غير متاح مؤقتًا — جرب كمان شوية'
          : 'التحقق الأمني فشل — أعد المحاولة',
      },
      { status: captcha.unavailable ? 503 : 400 },
    )
  }

  // The RPC is service-role-only; public callers must pass the checks above.
  const supabase = createServiceClient()
  const { data, error } = await supabase.rpc('find_by_phone', { p_phone: phone })

  if (error) {
    return NextResponse.json({ error: 'حصل خطأ في البحث' }, { status: 500 })
  }

  const result = Array.isArray(data) && data.length > 0 ? data[0] : null
  if (!result) {
    return NextResponse.json({ found: false, message: 'الرقم مش مسجل في EAH' })
  }

  // Return only fields needed by the UI. Never expose the internal user UUID or
  // extra database columns simply because the RPC currently returns them.
  const user = {
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
  }

  return NextResponse.json({ found: true, user })
}
