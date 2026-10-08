import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ═══════════════════════════════════════════════════════════
// EAH — Proxy (Middleware) — 2026
// Auth + Nonce-based CSP (per-request unique nonce)
// ═══════════════════════════════════════════════════════════

const PROTECTED_PREFIXES = ['/account', '/merchant', '/admin', '/notifications']
const PROTECTED_EXCEPTIONS = ['/merchant/apply']

const SUPABASE_HOST = 'npmpiivmdksdirrumbmt.supabase.co'
const CLOUDINARY_HOST = 'res.cloudinary.com'
const TURNSTILE_HOST = 'challenges.cloudflare.com'

function buildCSP(nonce: string, isDev: boolean): string {
  const directives: string[] = [
    "default-src 'self'",

    // Scripts: <script src> + <script nonce>
    isDev
      ? `script-src-elem 'self' 'unsafe-eval' 'unsafe-inline' https://${TURNSTILE_HOST}`
      : `script-src-elem 'self' 'nonce-${nonce}' https://${TURNSTILE_HOST}`,

    // Inline event handlers ممنوعة
    "script-src-attr 'none'",

    // Styles
    "style-src-elem 'self' 'unsafe-inline'",
    "style-src-attr 'unsafe-inline'",

    // Images
    `img-src 'self' data: blob: https://${CLOUDINARY_HOST} https://${SUPABASE_HOST} https://images.unsplash.com https://scontent-iad3-2.xx.fbcdn.net`,

    // Network
    `connect-src 'self' https://${SUPABASE_HOST} wss://${SUPABASE_HOST} https://api.cloudinary.com https://${TURNSTILE_HOST} https://openrouter.ai https://api.groq.com https://api.open-meteo.com`,

    // Fonts + Frames + Others
    "font-src 'self' data:",
    `frame-src 'self' https://${TURNSTILE_HOST}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "manifest-src 'self'",
    "worker-src 'self' blob:",
    "media-src 'self'",
    'upgrade-insecure-requests',

    // Reporting
    'report-uri /api/csp-report',
  ]

  return directives.join('; ')
}

export async function proxy(request: NextRequest) {
  // ─── Nonce: عشوائي فريد لكل request ───
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const isDev = process.env.NODE_ENV === 'development'
  const csp = buildCSP(nonce, isDev)

  // ─── Request headers نمرر فيها الـ nonce ───
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('x-pathname', request.nextUrl.pathname)

  // ─── Helper: نبني response مع CSP ───
  const makeResponse = () => {
    const r = NextResponse.next({ request: { headers: requestHeaders } })
    r.headers.set('Content-Security-Policy', csp)
    return r
  }

  let response = makeResponse()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) return response

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })
        response = makeResponse()
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  const isException = PROTECTED_EXCEPTIONS.some((ex) => pathname.startsWith(ex))

  if (isProtected && !isException && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/auth'
    redirectUrl.searchParams.set('next', pathname)
    const redirect = NextResponse.redirect(redirectUrl)
    redirect.headers.set('Content-Security-Policy', csp)
    return redirect
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff|woff2)$).*)',
  ],
}
