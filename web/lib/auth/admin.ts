import { createClient } from '@/lib/supabase/server'

// ═══════════════════════════════════════════════════════════
// EAH — Admin Authorization
//   • مصدر واحد: user_roles (مش profiles.role)
//   • SECURITY: reads own role only
// ═══════════════════════════════════════════════════════════

export type AdminContext =
  | {
      ok: true
      supabase: Awaited<ReturnType<typeof createClient>>
      userId: string
      role: 'admin' | 'super_admin'
    }
  | { ok: false; error: string }

export async function requireAdmin(): Promise<AdminContext> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { ok: false, error: 'غير مصرح' }

  const { data: row } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle()

  if (row?.role !== 'admin' && row?.role !== 'super_admin') {
    return { ok: false, error: 'غير مصرح' }
  }

  return {
    ok: true,
    supabase,
    userId: user.id,
    role: row.role as 'admin' | 'super_admin',
  }
}
