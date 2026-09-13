import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'بحث سريع | EAH Admin' }

export default async function AdminSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/admin/login')

  const { data: roleRow } = await supabase
    .from('user_roles').select('role').eq('user_id', userData.user.id).maybeSingle()
  if (roleRow?.role !== 'super_admin') redirect('/')

  const params = await searchParams
  const q = (params.q ?? '').trim()

  let businesses: any[] = []
  let users: any[] = []

  if (q.length >= 2) {
    const like = `%${q}%`
    const [bizRes, userRes] = await Promise.all([
      supabase.from('businesses').select('id,name,slug,business_type,area,is_published').or(`name.ilike.${like},slug.ilike.${like},area.ilike.${like}`).limit(20),
      supabase.from('profiles').select('id,display_name,phone,trust_score').or(`display_name.ilike.${like},phone.ilike.${like}`).limit(20),
    ])
    businesses = bizRes.data ?? []
    users = userRes.data ?? []
  }

  return (
    <section>
      <header className="eah-admin-page-header">
        <div>
          <span className="eah-admin-kicker">QUICK SEARCH</span>
          <h1>🔍 بحث سريع</h1>
          <p>ابحث في الأنشطة والمستخدمين</p>
        </div>
        <Link href="/admin" className="eah-admin-btn">← لوحة التحكم</Link>
      </header>

      <form method="GET" style={{ marginBottom: 24, maxWidth: 600 }}>
        <input
          name="q"
          defaultValue={q}
          placeholder="اكتب اسم نشاط، slug، منطقة، أو اسم مستخدم..."
          autoFocus
          style={{ width: '100%', padding: '14px 18px', borderRadius: 14, background: 'rgba(10,8,16,.7)', border: '1px solid rgba(139,92,246,.25)', color: '#F5F3FF', fontFamily: 'inherit', fontSize: '.95rem', outline: 'none' }}
        />
      </form>

      {q.length >= 2 && (
        <>
          {businesses.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: '.9rem', color: '#A855F7', margin: '0 0 12px', fontWeight: 800 }}>🏪 الأنشطة ({businesses.length})</h2>
              <div style={{ display: 'grid', gap: 8, maxWidth: 900 }}>
                {businesses.map(b => (
                  <Link key={b.id} href={`/admin/businesses/${b.id}`} style={{ padding: 14, borderRadius: 12, background: 'rgba(20,18,28,.6)', border: '1px solid rgba(139,92,246,.15)', textDecoration: 'none', color: 'inherit', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: '#F5F3FF', display: 'block', marginBottom: 4 }}>{b.name}</strong>
                      <span style={{ fontSize: '.75rem', color: '#A5A3B8' }}>{b.area} · {b.slug}</span>
                    </div>
                    <span style={{ fontSize: '.7rem', color: b.is_published ? '#4ADE80' : '#FCA5A5', fontWeight: 800 }}>{b.is_published ? 'منشور' : 'مسودة'}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {users.length > 0 && (
            <div>
              <h2 style={{ fontSize: '.9rem', color: '#A855F7', margin: '0 0 12px', fontWeight: 800 }}>👥 المستخدمون ({users.length})</h2>
              <div style={{ display: 'grid', gap: 8, maxWidth: 900 }}>
                {users.map(u => (
                  <Link key={u.id} href={`/admin/users?u=${u.id}`} style={{ padding: 14, borderRadius: 12, background: 'rgba(20,18,28,.6)', border: '1px solid rgba(139,92,246,.15)', textDecoration: 'none', color: 'inherit', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: '#F5F3FF', display: 'block', marginBottom: 4 }}>{u.display_name ?? 'مستخدم'}</strong>
                      <span style={{ fontSize: '.75rem', color: '#A5A3B8' }}>{u.phone ?? '—'}</span>
                    </div>
                    <span style={{ fontSize: '.75rem', color: '#FBBF24', fontWeight: 800 }}>⭐ {u.trust_score ?? 0}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {businesses.length === 0 && users.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: '#A5A3B8', borderRadius: 16, background: 'rgba(20,18,28,.5)' }}>
              مفيش نتايج لـ "{q}"
            </div>
          )}
        </>
      )}
    </section>
  )
}
