import { createHash } from 'crypto'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getClientIp, strictLimiter, checkRateLimit } from '@/lib/rate-limit'
import { normalizePhoneDestination, normalizeWhatsAppDestination } from '@/lib/data/contact-availability-utils'

const schema = z.object({
  businessId: z.string().uuid(),
  method: z.enum(['phone', 'whatsapp']),
  contactId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
}).refine((data) => !(data.contactId && data.branchId), {
  message: 'اختر جهة اتصال واحدة فقط',
})

const MAX_BODY_BYTES = 8192

async function readLimitedJson(
  request: Request,
): Promise<{ ok: true; value: unknown } | { ok: false; tooLarge: boolean }> {
  const contentLength = Number(request.headers.get('content-length') ?? '0')
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return { ok: false, tooLarge: true }
  }

  const reader = request.body?.getReader()
  if (!reader) return { ok: false, tooLarge: false }

  const chunks: Uint8Array[] = []
  let totalBytes = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      totalBytes += value.byteLength
      if (totalBytes > MAX_BODY_BYTES) {
        await reader.cancel().catch(() => undefined)
        return { ok: false, tooLarge: true }
      }
      chunks.push(value)
    }
  } catch {
    return { ok: false, tooLarge: false }
  }

  const bytes = new Uint8Array(totalBytes)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }

  try {
    return { ok: true, value: JSON.parse(new TextDecoder().decode(bytes)) }
  } catch {
    return { ok: false, tooLarge: false }
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.is_anonymous) {
    return NextResponse.json({ ok: false, error: 'registered_login_required' }, { status: 401 })
  }

  const body = await readLimitedJson(request)
  if (!body.ok) {
    return NextResponse.json(
      { ok: false, error: body.tooLarge ? 'payload_too_large' : 'invalid' },
      { status: body.tooLarge ? 413 : 400 },
    )
  }

  const parsed = schema.safeParse(body.value)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 })
  }

  const ip = await getClientIp()
  const rateLimit = await checkRateLimit(strictLimiter, `track-contact:${user.id}:${ip}`, {
    failClosed: true,
  })
  if (!rateLimit.ok) {
    const unavailable = rateLimit.error.startsWith('تعذر')
    return NextResponse.json(
      { ok: false, error: rateLimit.error },
      {
        status: unavailable ? 503 : 429,
        headers: unavailable ? { 'Retry-After': '60' } : {},
      },
    )
  }

  let privileged: ReturnType<typeof createServiceClient>
  try {
    privileged = createServiceClient()
  } catch {
    return NextResponse.json({ ok: false, error: 'service_unavailable' }, { status: 503 })
  }

  const { data: business, error: businessError } = await privileged
    .from('businesses')
    .select('id, is_published')
    .eq('id', parsed.data.businessId)
    .maybeSingle()
  if (businessError) {
    console.error('[track-contact] business lookup failed:', businessError.message)
    return NextResponse.json({ ok: false, error: 'تعذر التحقق من النشاط' }, { status: 500 })
  }
  if (!business?.is_published) {
    return NextResponse.json({ ok: false, error: 'النشاط مش متاح' }, { status: 404 })
  }
  const normalizeCandidate = (candidate: unknown): string | null =>
    parsed.data.method === 'whatsapp'
      ? normalizeWhatsAppDestination(candidate)
      : normalizePhoneDestination(candidate)

  let value: string | null = null

  if (parsed.data.branchId) {
    const { data: branch, error: branchError } = await privileged
      .from('business_branches')
      .select('phone, whatsapp')
      .eq('id', parsed.data.branchId)
      .eq('business_id', parsed.data.businessId)
      .eq('is_active', true)
      .maybeSingle()
    if (branchError) {
      console.error('[track-contact] selected branch lookup failed:', branchError.message)
      return NextResponse.json({ ok: false, error: 'تعذر جلب بيانات التواصل' }, { status: 500 })
    }
    value = normalizeCandidate(branch?.[parsed.data.method])
  } else if (parsed.data.contactId) {
    const { data: contact, error: contactError } = await privileged
      .from('business_contact_methods')
      .select('value')
      .eq('id', parsed.data.contactId)
      .eq('business_id', parsed.data.businessId)
      .eq('method_type', parsed.data.method)
      .eq('is_public', true)
      .maybeSingle()
    if (contactError) {
      console.error('[track-contact] selected contact lookup failed:', contactError.message)
      return NextResponse.json({ ok: false, error: 'تعذر جلب بيانات التواصل' }, { status: 500 })
    }
    value = normalizeCandidate(contact?.value)
  } else {
    const { data: branches, error: branchError } = await privileged
      .from('business_branches')
      .select('phone, whatsapp, is_primary, sort_order')
      .eq('business_id', parsed.data.businessId)
      .eq('is_active', true)
      .order('is_primary', { ascending: false })
      .order('sort_order', { ascending: true })
      .limit(25)
    if (branchError) {
      console.error('[track-contact] branch lookup failed:', branchError.message)
      return NextResponse.json({ ok: false, error: 'تعذر جلب بيانات التواصل' }, { status: 500 })
    }

    value = (branches ?? [])
      .map((row) => normalizeCandidate(row[parsed.data.method]))
      .find((candidate): candidate is string => candidate !== null) ?? null

    if (!value) {
      const { data: contactRows, error: contactError } = await privileged
        .from('business_contact_methods')
        .select('value, is_primary, sort_order')
        .eq('business_id', parsed.data.businessId)
        .eq('method_type', parsed.data.method)
        .eq('is_public', true)
        .order('is_primary', { ascending: false })
        .order('sort_order', { ascending: true })
        .limit(25)
      if (contactError) {
        console.error('[track-contact] contact lookup failed:', contactError.message)
        return NextResponse.json({ ok: false, error: 'تعذر جلب بيانات التواصل' }, { status: 500 })
      }
      value = (contactRows ?? [])
        .map((row) => normalizeCandidate(row.value))
        .find((candidate): candidate is string => candidate !== null) ?? null
    }
  }

  if (!value) {
    return NextResponse.json({ ok: false, error: 'بيانات التواصل مش متاحة أو الرقم غير صالح' }, { status: 404 })
  }

  const visitorHash = createHash('sha256')
    .update(`${user.id}:${parsed.data.businessId}:${parsed.data.method}`)
    .digest('hex')
  const { error: revealError } = await privileged.rpc('reveal_contact', {
    p_business_id: parsed.data.businessId,
    p_method_type: parsed.data.method,
    p_visitor_hash: visitorHash,
  })

  if (revealError) {
    console.error('[track-contact] contact reveal failed:', revealError.message)
    return NextResponse.json({ ok: false, error: 'تعذر تسجيل العملية' }, { status: 500 })
  }

  // Feed the trend engine with an intentional, authenticated contact action.
  // The contact reveal remains successful even if analytics storage is unavailable.
  const salt = process.env.EAH_VISITOR_SALT
  const ipHash = salt
    ? createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 16)
    : null
  const { error: eventError } = await privileged.from('engagement_events').insert({
    business_id: parsed.data.businessId,
    user_id: user.id,
    action: parsed.data.method === 'phone' ? 'phone_reveal' : 'whatsapp',
    ip_hash: ipHash,
    user_agent: request.headers.get('user-agent')?.slice(0, 200) ?? null,
  })
  if (eventError) {
    console.error('[track-contact] engagement event insert failed:', eventError.message)
  }

  return NextResponse.json({ ok: true, value })
}
