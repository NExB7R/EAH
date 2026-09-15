import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

async function handleLogout(request: NextRequest) {
  const supabase = await createClient()

  // signOut يمسح الـ session cookies من جهة الـ server
  await supabase.auth.signOut({ scope: 'global' }).catch(() => {
    // حتى لو فشل، نكمل — نمسح الكوكيز بشكل يدوي
  })

  const url = request.nextUrl.clone()
  url.pathname = '/'
  url.search = ''

  const res = NextResponse.redirect(url, { status: 303 })

  // مسح احتياطي لكل الـ Supabase cookies
  const cookies = request.cookies.getAll()
  for (const c of cookies) {
    if (c.name.startsWith('sb-')) {
      res.cookies.set(c.name, '', {
        path: '/',
        maxAge: 0,
        expires: new Date(0),
        sameSite: 'lax',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      })
    }
  }

  return res
}

export async function POST(request: NextRequest) {
  return handleLogout(request)
}

// للسماح بـ GET من الروابط في حالة الطوارئ
export async function GET(request: NextRequest) {
  return handleLogout(request)
}
