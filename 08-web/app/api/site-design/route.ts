import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_designs')
    .select('data,updated_at')
    .eq('key', 'home')
    .maybeSingle()
  return NextResponse.json(
    { data: data?.data ?? null, updated_at: data?.updated_at ?? null },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
