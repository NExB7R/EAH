import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase-server'
import { checkRate, getClientIp } from '@/lib/security/rate-limit'
import { extractFromHtml, type ExtractedData } from '@/lib/collect/parser'

const schema = z.object({
  url: z.string().url(),
})

async function requireAdmin() {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return { ok: false, sb: null }
  const { data: role } = await sb
    .from('user_roles').select('role').eq('user_id', user.id).eq('role', 'super_admin').maybeSingle()
  return { ok: !!role, sb }
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), 12000)
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; EAHCollect/2026; +https://eah-sq.vercel.app)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'ar-EG,ar;q=0.9,en;q=0.8',
      },
      signal: controller.signal,
      redirect: 'follow',
    })
    clearTimeout(t)
    if (!res.ok) return null
    return await res.text()
  } catch { return null }
}

// حساب مستوى الثقة لكل حقل
function computeConfidence(data: ExtractedData) {
  return {
    name: data.name.length >= 3 && data.name.length <= 100 ? 90 : 40,
    type: data.type ? 95 : 30,
    phone: data.phones.length > 0 ? 95 : 20,
    whatsapp: data.whatsapp ? 85 : 30,
    address: data.address ? 75 : 20,
    hours: data.hours ? 70 : 15,
    cuisine: data.cuisine ? 80 : 20,
    description: data.description.length >= 30 ? 80 : 40,
    image: data.image ? 90 : 20,
  }
}

export async function POST(req: Request) {
  const ip = getClientIp(req)
  const rl = checkRate(`collect:${ip}`, 20, 60_000)
  if (!rl.ok) return NextResponse.json({ ok: false, error: 'rate_limit' }, { status: 429 })

  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'bad_url' }, { status: 400 })

  const { url } = parsed.data
  const html = await fetchHtml(url)
  if (!html) return NextResponse.json({ ok: false, error: 'fetch_failed' }, { status: 502 })

  const data = extractFromHtml(html, url)
  const confidence = computeConfidence(data)

  return NextResponse.json({
    ok: true,
    data,
    confidence,
    source: {
      url,
      platform: /facebook|fb\.com/i.test(url) ? 'facebook'
              : /instagram/i.test(url) ? 'instagram'
              : /google\./i.test(url) ? 'google'
              : 'web',
      fetched_at: new Date().toISOString(),
    },
  })
}
