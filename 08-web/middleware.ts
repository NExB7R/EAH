import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * EAH — Middleware
 *
 * المسؤوليات:
 *  1) تجديد Supabase session على كل request
 *  2) حماية المسارات الحساسة (/admin, /merchant, /account)
 *  3) تحويل المستخدم المسجل بعيد عن /auth
 *
 * ⚠️ مهم: مفيش logic بين createServerClient و getUser().
 *    Supabase بتحذّر إن أي logic هنا بيعمل مشاكل debugging صعبة.
 */
export async function middleware(request: NextRequest) {
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

  // المسارات اللي محتاجة تسجيل دخول
  const protectedPaths = ['/admin', '/merchant', '/account']
  const isProtected = protectedPaths.some((p) => path.startsWith(p))

  // استثناء: /admin/login مسموح للزوار
  const isAuthException = path === '/admin/login'

  if (isProtected && !isAuthException && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    url.searchParams.set('next', path)
    return NextResponse.redirect(url)
  }

  // لو مسجل دخول، مايخشش على /auth تاني
  if (path === '/auth' && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * شغّل الـ middleware على كل المسارات ما عدا:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - صور (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webm|mp4)$).*)',
  ],
}
