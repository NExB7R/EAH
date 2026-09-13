/**
 * EAH — routing helpers
 * Single source of truth for role-based redirects.
 */

export type AppRole = 'customer' | 'merchant' | 'admin' | 'super_admin'

export function getDashboardPath(role: string | null | undefined): string {
  if (role === 'super_admin' || role === 'admin') return '/admin'
  if (role === 'merchant') return '/merchant'
  return '/account'
}

export function isStaff(role: string | null | undefined): boolean {
  return role === 'admin' || role === 'super_admin'
}

export function isMerchant(role: string | null | undefined): boolean {
  return role === 'merchant'
}
