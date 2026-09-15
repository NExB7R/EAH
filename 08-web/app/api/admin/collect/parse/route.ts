import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { checkRate, getClientIp } from '@/lib/security/rate-limit'
import { extractFromHtml } from '@/lib/collect/parser'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const Schema = z.object({
  url: z.string().url().max(500),
})

const ALLOWED_DOMAINS = [
  'facebook.com', 'fb.com', 'fb.me',
  'instagram.com',
  'maps.google.com', 'goo.gl', 'maps.app.goo.gl',
]

function isAllowed(url: string): boolean {
  try {
    const u = new URL(url)
    return ALLOWED_DOMAINS.some((d) => u.hostname === d || u.hostname.endsWith('.' + d))
  } catch {
    return false
  }
}

async function fetchPage(url: string, mobile: boolean): Promise<string | null> {
  const target = mobile
    ? url.replace(/^(https?:\/\/)?(www\.)?facebook\.com/, 'https://m.facebook.com')
    : url

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12000)

  try {
    const res = await fetch(target, {
      headers: {
        'User-Agent': mobile
          ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
          : 'Mozilla/5.0 (compatible; EAH-Collector/2.0; +https://eah-sq.vercel.app)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'ar-EG,ar;q=0.9,en;q=0.8',
      },
      signal: controller.signal,
      redirect: 'follow',
    })
    clearTimeout(timeout)

    if (!res.ok) return null
    return await res.text()
  } catch {
    clearTimeout(timeout)
    return null
  }
}

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const { ok: rlOk } = checkRate('collect-parse:' + ip, 30, 60_000)
  if (!rlOk) return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 })

  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return NextResponse.json({ ok: false }, { status: 401 })

  const { data: role } = await supabase
    .from('user_roles').select('role').eq('user_id', userData.user.id).maybeSingle()
  if (role?.role !== 'super_admin') {
    return NextResponse.json({ ok: false }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_url' }, { status: 400 })
  }

  const { url } = parsed.data
  if (!isAllowed(url)) {
    return NextResponse.json({ ok: false, error: 'domain_not_allowed' }, { status: 400 })
  }

  let html = await fetchPage(url, false)
  if (!html || html.length < 500) {
    html = await fetchPage(url, true)
  }

  if (!html) {
    return NextResponse.json({ ok: false, error: 'fetch_failed' }, { status: 502 })
  }

  const data = extractFromHtml(html, url)

  return NextResponse.json({ ok: true, data })
}
