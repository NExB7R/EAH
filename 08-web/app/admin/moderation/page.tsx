import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import ModerationClient from './ModerationClient'
import './moderation.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'مراجعة التقييمات' }

export default async function ModerationPage() {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) redirect('/admin/login')
  const { data: role } = await supabase.from('user_roles').select('role').eq('user_id', user.user.id).maybeSingle()
  if (role?.role !== 'super_admin') redirect('/')

  const { data: flagged } = await supabase.rpc('get_flagged_reviews')

  return (
    <main className="mod">
      <header className="mod__hero">
        <Link href="/admin" className="mod__back">← غرفة التحكم</Link>
        <span className="mod__kicker">مراجعة المحتوى</span>
        <h1 className="mod__title">✍️ التقييمات قيد المراجعة</h1>
        <p className="mod__sub">المراجعات اللي فيها روابط أو ألفاظ — محتاجة قرارك</p>
      </header>

      {(!flagged || flagged.length === 0) ? (
        <div className="mod__empty">
          <span className="mod__empty-emoji">✨</span>
          <p>مفيش حاجة قيد المراجعة — كل التقييمات نضيفة</p>
        </div>
      ) : (
        <ModerationClient flagged={flagged} />
      )}
    </main>
  )
}
