import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) return response

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isProtected = path.startsWith('/admin') || path.startsWith('/merchant')

  // استثنِ /auth/logout و /auth/callback من أي redirect
  // (logout محتاج يوصل للـ route حتى لو المستخدم لسه logged in)
  const isAuthFlowExempt =
    path === '/auth/logout' ||
    path.startsWith('/auth/callback')

  const isAuthPage = path.startsWith('/auth') && !isAuthFlowExempt

  if (isProtected && !user) {
    const redirect = request.nextUrl.clone()
    redirect.pathname = '/auth'
    redirect.searchParams.set('next', path)
    return NextResponse.redirect(redirect)
  }

  if (isAuthPage && user) {
    const next = request.nextUrl.searchParams.get('next')
    const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : null
    const redirect = request.nextUrl.clone()
    redirect.pathname = safeNext ?? '/account'
    redirect.search = ''
    return NextResponse.redirect(redirect)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|opengraph-image|manifest.webmanifest|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|txt|xml)$).*)',
  ],
}
