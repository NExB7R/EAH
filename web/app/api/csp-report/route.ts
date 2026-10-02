import { NextResponse } from 'next/server'

// ═══════════════════════════════════════════════════════════
// EAH — CSP Violation Report
// يستقبل تقارير CSP من المتصفح → يسجّلها في console
// (Vercel logs — مجاني)
// ═══════════════════════════════════════════════════════════

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const report = body['csp-report'] ?? body

    // سجّل بحد أدنى عشان Vercel logs
    const violated = report['violated-directive'] ?? 'unknown'
    const blocked = report['blocked-uri'] ?? 'unknown'
    const document = report['document-uri'] ?? 'unknown'

    console.warn('[CSP-VIOLATION]', {
      directive: violated,
      blocked,
      document: document.slice(0, 120),
    })
  } catch {
    /* ignore malformed */
  }

  return new NextResponse(null, { status: 204 })
}

export async function GET() {
  return NextResponse.json({ ok: true, endpoint: 'csp-report' })
}
