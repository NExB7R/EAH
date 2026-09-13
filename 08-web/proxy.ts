import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * EAH — Proxy (formerly Middleware)
 *
 * Next.js 16 renamed `middleware` to `proxy`.
 * See: https://nextjs.org/docs/app/getting-started/proxy
 *
 * المسؤوليات:
 *  1) تجديد Supabase session على كل request
 *  2) حماية المسارات الحساسة (/admin, /merchant, /account)
 *  3) تحويل المستخدم المسجل بعيد عن /auth
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // ⚠️ لا تكتب أي كود بين createServerClient و getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const protectedPaths = ['/admin', '/merchant', '/account']
  const isProtected = protectedPaths.some((p) => path.startsWith(p))
  const isAuthException = path === '/admin/login'

  if (isProtected && !isAuthException && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    url.searchParams.set('next', path)
    return NextResponse.redirect(url)
  }

  if (path === '/auth' && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webm|mp4)$).*)',
  ],
}
