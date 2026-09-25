import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

// ═══════════════════════════════════════════════════════════
// EAH — User Session Fetcher (Combined Query)
// ═══════════════════════════════════════════════════════════
// يقلل 4 queries → 1 query + React.cache
// ═══════════════════════════════════════════════════════════

export type AppRole = 'customer' | 'merchant' | 'admin' | 'super_admin'

export type UserSession = {
  userId: string
  email: string | null
  displayName: string
  avatarUrl: string | null
  role: AppRole
  notifCount: number
  phoneVerified: boolean
  emailVerified: boolean
}

export const getUserSession = cache(async (): Promise<UserSession | null> => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const [{ data: profile }, { data: roleRow }, { count }] = await Promise.all([
    supabase
      .from('profiles')
      .select('display_name, avatar_url, phone_verified_at')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('read_at', null),
  ])

  return {
    userId: user.id,
    email: user.email ?? null,
    displayName: profile?.display_name ?? 'مستخدم EAH',
    avatarUrl: profile?.avatar_url ?? null,
    role: (roleRow?.role as AppRole) ?? 'customer',
    notifCount: count ?? 0,
    phoneVerified: !!profile?.phone_verified_at,
    emailVerified: !!user.email_confirmed_at,
  }
})
