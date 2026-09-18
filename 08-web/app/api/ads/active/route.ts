import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export const revalidate = 60

export async function GET(request: Request) {
  const url = new URL(request.url)
  const slotCode = url.searchParams.get('slot') ?? ''
  if (!slotCode) return NextResponse.json({ ad: null })

  const sb = await createClient()
  const { data: slot } = await sb
    .from('ad_slots').select('id,code').eq('code', slotCode).eq('is_active', true).maybeSingle()
  if (!slot) return NextResponse.json({ ad: null })

  const now = new Date().toISOString()
  const { data: ad } = await sb
    .from('ads')
    .select('id,title,description,image_url,target_url,status,starts_at,ends_at')
    .eq('slot_id', slot.id)
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
  })
}
