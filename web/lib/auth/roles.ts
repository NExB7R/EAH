import { createClient } from '@/lib/supabase/server'

// ═══════════════════════════════════════════════════════════
// EAH — Roles (Central Authority)
// The stored account role is independent from business ownership.
// ═══════════════════════════════════════════════════════════

export type Role = 'guest' | 'customer' | 'merchant' | 'super_admin'

export type RoleContext = {
  role: Role
  userId: string | null
  isAdmin: boolean
  isMerchant: boolean
  hasBusiness: boolean
}

export async function getRoleContext(): Promise<RoleContext> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.is_anonymous) {
    return { role: 'guest', userId: null, isAdmin: false, isMerchant: false, hasBusiness: false }
  }

  const [{ data: roleRow }, { data: biz }] = await Promise.all([
    supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle(),
    supabase.from('businesses').select('id').eq('owner_profile_id', user.id).limit(1).maybeSingle(),
  ])

  // Only the stored account role grants the matching workspace permissions.
  // A linked business is tracked separately and never promotes the account role.
  const role: Role =
    roleRow?.role === 'super_admin'
      ? 'super_admin'
      : roleRow?.role === 'merchant'
        ? 'merchant'
        : 'customer'

  return {
    role,
    userId: user.id,
    isAdmin: role === 'super_admin',
    isMerchant: role === 'merchant',
    hasBusiness: !!biz,
  }
}

export function getRedirectForRole(role: Role, pathname: string): string | null {
  if (role === 'super_admin') {
    // استثناء: الأدمن يقدر يعدل بروفايله
    if (pathname.startsWith('/account/edit')) return null
    if (pathname.startsWith('/account') || pathname.startsWith('/merchant')) {
      return '/admin'
    }
    return null
  }
  if (role === 'customer' || role === 'guest') {
    if (pathname.startsWith('/merchant') && !pathname.startsWith('/merchant/apply')) {
      return '/merchant/apply'
    }
  }
  return null
}
