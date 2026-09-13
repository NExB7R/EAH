import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'استوديو التصميم | EAH Admin' }

export default async function AdminStudioPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/admin/login')

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userData.user.id)
    .maybeSingle()

  if (roleRow?.role !== 'super_admin') redirect('/')

  return (
    <section>
      <header className="eah-admin-page-header">
        <div>
          <span className="eah-admin-kicker">DESIGN STUDIO</span>
          <h1>🎨 استوديو التصميم</h1>
          <p>صفحة التصميم الرئيسية بتفتح من الرابط المخصص ليها.</p>
        </div>
      </header>

      <div style={{
        padding: 32,
        borderRadius: 24,
        background: 'linear-gradient(135deg, rgba(139,92,246,.1), rgba(168,85,247,.04))',
        border: '1px solid rgba(139,92,246,.25)',
        display: 'flex', flexDirection: 'column', gap: 18,
        maxWidth: 640,
      }}>
        <span style={{ fontSize: '3rem' }}>🎨</span>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#F5F3FF', margin: 0 }}>
          استوديو التصميم الكامل
        </h2>
        <p style={{ color: '#A5A3B8', fontSize: '0.92rem', lineHeight: 1.8, margin: 0 }}>
          الاستوديو الكامل (Page Builder Pro) متاح في المسار المخصص. ده نسخة كاملة
          فيها drag & drop، تخصيص كل عنصر، وحفظ التصميم.
        </p>
        <Link
          href="/studio"
          className="eah-admin-btn eah-admin-btn--primary"
          style={{ width: 'fit-content', padding: '14px 28px' }}
        >
          افتح الاستوديو الكامل →
        </Link>
      </div>
    </section>
  )
}
