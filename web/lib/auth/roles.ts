import { createClient } from '@/lib/supabase/server'

// ═══════════════════════════════════════════════════════════
// EAH — Roles (Central Authority) — 2026-10-08
// ROLES_MATRIX.md — single source of truth for role logic
// ═══════════════════════════════════════════════════════════

export type Role = 'guest' | 'customer' | 'merchant' | 'admin'

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

  if (!user) {
    return { role: 'guest', userId: null, isAdmin: false, isMerchant: false, hasBusiness: false }
  }

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle()

  if (roleRow?.role === 'admin' || roleRow?.role === 'super_admin') {
    return { role: 'admin', userId: user.id, isAdmin: true, isMerchant: false, hasBusiness: false }
  }

  const { data: biz } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_profile_id', user.id)
    .limit(1)
    .maybeSingle()

  if (biz) {
    return {
      role: 'merchant',
      userId: user.id,
      isAdmin: false,
      isMerchant: true,
      hasBusiness: true,
    }
  }

  return {
    role: 'customer',
    userId: user.id,
    isAdmin: false,
    isMerchant: false,
    hasBusiness: false,
  }
}

export function getRedirectForRole(role: Role, pathname: string): string | null {
  if (role === 'admin') {
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
