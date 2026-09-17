import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import ReleaseForm from './ReleaseForm'
import './releases.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'التحديثات' }

export default async function ReleasesPage() {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) redirect('/admin/login')
  const { data: role } = await supabase.from('user_roles').select('role').eq('user_id', user.user.id).maybeSingle()
  if (role?.role !== 'super_admin') redirect('/')

  const { data: notes } = await supabase
    .from('release_notes')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(50)

  return (
    <main className="rel">
      <header className="rel__hero">
        <Link href="/admin" className="rel__back">← غرفة التحكم</Link>
        <span className="rel__kicker">التحديثات</span>
        <h1 className="rel__title">نشر تحديث جديد</h1>
        <p className="rel__sub">انشر التحديث — هيوصل للمستخدمين حسب الجمهور المختار</p>
      </header>
      <ReleaseForm />

      <section className="rel__history">
        <h2 className="rel__history-title">التحديثات المنشورة ({notes?.length ?? 0})</h2>
        {(!notes || notes.length === 0) ? (
          <p className="rel__empty">لسه مفيش تحديثات</p>
        ) : (
          <div className="rel__list">
            {notes.map((r) => (
              <article key={r.id} className="rel-item">
                <div className="rel-item__head">
                  <span className="rel-item__version">v{r.version}</span>
                  <span className="rel-item__audience">{r.audience}</span>
                  <time className="rel-item__time">{new Date(r.published_at).toLocaleDateString('ar-EG')}</time>
                </div>
                <h3 className="rel-item__title">{r.title}</h3>
                {r.body && <p className="rel-item__body">{r.body}</p>}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
