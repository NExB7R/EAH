import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

async function handle(request: NextRequest) {
  const supabase = await createClient()
  await supabase.auth.signOut({ scope: 'global' }).catch(() => {})

  const url = request.nextUrl.clone()
  url.pathname = '/admin/login'
  url.search = ''

  const res = NextResponse.redirect(url, { status: 303 })
  const cookies = request.cookies.getAll()
  for (const c of cookies) {
    if (c.name.startsWith('sb-')) {
      res.cookies.set(c.name, '', {
        path: '/', maxAge: 0, expires: new Date(0),
        sameSite: 'lax', httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      })
    }
  }
  return res
}

export async function POST(request: NextRequest) { return handle(request) }
export async function GET(request: NextRequest) { return handle(request) }
