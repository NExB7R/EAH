import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export const revalidate = 60

export async function GET(request: Request) {
  const url = new URL(request.url)
  const slotCode = url.searchParams.get('slot') ?? ''
  if (!slotCode) return NextResponse.json({ ad: null })

  const sb = await createClient()
  const now = new Date().toISOString()

  // ═══ Query واحد بـ JOIN — بدل اتنين ═══
  const { data: ad } = await sb
    .from('ads')
    .select(`
      id, title, description, image_url, target_url,
      ad_slots!inner(code, is_active)
    `)
    .eq('ad_slots.code', slotCode)
    .eq('ad_slots.is_active', true)
    .eq('status', 'approved')
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!ad) return NextResponse.json({ ad: null })

  return NextResponse.json({
    ad: {
      id: ad.id,
      title: ad.title,
      description: ad.description,
      image_url: ad.image_url,
      href: ad.target_url ?? '/',
    },
  }, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  })
}
