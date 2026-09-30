import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// عميل السيرفر مع cookies (auth-aware)
// يُستخدم في: Server Components / Route Handlers
// ⚠️ new client لكل request — ممنوع sharing
export async function createClient() {
  const cookieStore = await cookies()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) {
    throw new Error(
      'Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    )
  }

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // setAll من Server Component — مش مسموح
          // الـ middleware (proxy.ts) هو اللي بيحدّث الـ cookies
        }
      },
    },
  })
}
