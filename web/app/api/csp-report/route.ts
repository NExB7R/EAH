import { NextResponse } from 'next/server'
import { apiLimiter, checkRateLimit, getClientIp } from '@/lib/rate-limit'

const MAX_REPORT_BYTES = 16_384

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function safeString(value: unknown, maxLength = 120): string {
  return typeof value === 'string' ? value.slice(0, maxLength) : 'unknown'
}

export async function POST(request: Request) {
  const ip = await getClientIp()
  const rateLimit = await checkRateLimit(apiLimiter, `csp-report:${ip}`, {
    failClosed: true,
  })

  if (!rateLimit.ok) {
    const unavailable = rateLimit.error.startsWith('تعذر')
    return new NextResponse(null, {
      status: unavailable ? 503 : 429,
      headers: unavailable ? { 'Retry-After': '60' } : {},
    })
  }

  const declaredLength = Number(request.headers.get('content-length') ?? '0')
  if (Number.isFinite(declaredLength) && declaredLength > MAX_REPORT_BYTES) {
    return new NextResponse(null, { status: 413 })
  }

  try {
    const raw = await request.text()
    if (new TextEncoder().encode(raw).byteLength > MAX_REPORT_BYTES) {
      return new NextResponse(null, { status: 413 })
    }

    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed)) return new NextResponse(null, { status: 204 })

    const reportValue = parsed['csp-report'] ?? parsed
    if (!isRecord(reportValue)) return new NextResponse(null, { status: 204 })

    console.warn('[CSP-VIOLATION]', {
      directive: safeString(reportValue['violated-directive'], 100),
      blocked: safeString(reportValue['blocked-uri'], 200),
      document: safeString(reportValue['document-uri'], 120),
    })
  } catch {
    // CSP reports are best-effort telemetry; malformed payloads are ignored.
  }

  return new NextResponse(null, { status: 204 })
}

export async function GET() {
  return NextResponse.json({ ok: true, endpoint: 'csp-report' })
}
