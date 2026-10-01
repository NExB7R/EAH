import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiLimiter, checkRateLimit, getClientIp } from '@/lib/rate-limit'

// ═══════════════════════════════════════════════════════════
// EAH — Find by Phone (Truecaller Style)
// ═══════════════════════════════════════════════════════════

const EGYPT_PHONE_REGEX = /^01[0125][0-9]{8}$/

export async function POST(request: NextRequest) {
  // Rate limit
  const ip = await getClientIp()
  const rl = await checkRateLimit(apiLimiter, `find:${ip}`)
  if (!rl.ok) {
    return NextResponse.json({ error: rl.error }, { status: 429 })
  }

  const body = (await request.json().catch(() => ({}))) as { phone?: string }
  const phone = body.phone?.trim() ?? ''

  // فحص الشكل
  if (!phone) {
    return NextResponse.json({ error: 'الرقم فاضي' }, { status: 400 })
  }

  // فحص النقص
  if (phone.length < 11) {
    return NextResponse.json(
      { error: 'الرقم ناقص — لازم 11 رقم', status: 'incomplete' },
      { status: 400 },
    )
  }

  // فحص الصيغة
  if (!EGYPT_PHONE_REGEX.test(phone)) {
    return NextResponse.json(
      { error: 'الرقم مش صح — لازم يبدأ بـ 010/011/012/015', status: 'invalid' },
      { status: 400 },
    )
  }

  // البحث
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('find_by_phone', { p_phone: phone })

  if (error) {
    return NextResponse.json({ error: 'حصل خطأ في البحث' }, { status: 500 })
  }

  const result = Array.isArray(data) && data.length > 0 ? data[0] : null

  if (!result) {
    return NextResponse.json({ found: false, message: 'الرقم مش مسجل في EAH' })
  }

  return NextResponse.json({ found: true, user: result })
}
