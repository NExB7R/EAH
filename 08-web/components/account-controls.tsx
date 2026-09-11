'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

type Role = 'customer' | 'merchant' | 'admin' | 'super_admin' | null

export default function AccountControls() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [userLabel, setUserLabel] = useState('')
  const [role, setRole] = useState<Role>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    const sync = async () => {
      const { data } = await supabase.auth.getUser()
      const user = data.user
      if (!user) {
        setReady(true)
        setUserLabel('')
        setRole(null)
        return
      }

      setUserLabel(String(user.user_metadata?.display_name ?? 'حسابك'))
      const { data: roleRow } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle()
      setRole((roleRow?.role as Role) ?? 'customer')
      setReady(true)
    }

    void sync()

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUserLabel('')
        setRole(null)
        setReady(true)
        return
      }
      void sync()
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function signOut() {
    if (busy) return
    setBusy(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signOut({ scope: 'local' })
    if (error) {
      setBusy(false)
      return
    }
    router.replace('/auth')
    router.refresh()
  }

  if (!ready || !userLabel) return null

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
      <span className="meta" style={{ whiteSpace: 'nowrap' }}>{userLabel}{role === 'super_admin' ? ' • Super Admin' : ''}</span>
      <Link className="eah-admin-btn" href="/auth/change-password">تغيير كلمة المرور 🔒</Link>
      {role === 'super_admin' && <Link className="eah-admin-btn" href="/admin">لوحة الإدارة</Link>}
      <button type="button" className="eah-admin-btn" onClick={signOut} disabled={busy}>
        {busy ? 'جاري الخروج…' : 'تسجيل الخروج'}
      </button>
    </div>
  )
}
