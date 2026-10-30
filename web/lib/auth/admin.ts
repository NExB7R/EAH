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
      role: 'super_admin'
    }
  | { ok: false; error: string }

export async function requireAdmin(): Promise<AdminContext> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.is_anonymous) return { ok: false, error: 'غير مصرح' }

  try {
    const { data: row, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      console.error('[requireAdmin] role lookup failed:', error.message)
      return { ok: false, error: 'تعذر التحقق من الصلاحيات' }
    }

    if (row?.role !== 'super_admin') {
      return { ok: false, error: 'غير مصرح' }
    }

    return {
      ok: true,
      supabase,
      userId: user.id,
      role: 'super_admin',
    }
  } catch (err) {
    console.error('[requireAdmin] unexpected error:', err)
    return { ok: false, error: 'تعذر التحقق من الصلاحيات' }
  }
}
