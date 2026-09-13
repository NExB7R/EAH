import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'الإحالات' }

export default async function AdminReferralsPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/admin/login')

  const { data: roleRow } = await supabase
    .from('user_roles').select('role').eq('user_id', userData.user.id).maybeSingle()
  if (roleRow?.role !== 'super_admin') redirect('/')

  const { data: refs } = await supabase
    .from('referrals')
    .select(`
      id,code,bonus_points,created_at,
      referrer:profiles!referrals_referrer_id_fkey (display_name,phone,referral_code),
      referred:profiles!referrals_referred_id_fkey (display_name,phone)
    `)
    .order('created_at', { ascending: false })
    .limit(200)

  const totalRefs = refs?.length ?? 0
  const totalBonus = (refs ?? []).reduce((s, r) => s + (r.bonus_points ?? 0), 0)

  return (
    <section>
      <header className="eah-admin-page-header">
        <div>
          <span className="eah-admin-kicker">REFERRALS</span>
          <h1>🎁 الإحالات</h1>
          <p>{totalRefs} إحالة · {totalBonus} نقطة موزعة</p>
        </div>
        <Link href="/admin" className="eah-admin-btn">← لوحة التحكم</Link>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, maxWidth: 500, marginBottom: 24 }}>
        <div style={{ padding: 18, borderRadius: 16, background: 'rgba(20,18,28,.6)', border: '1px solid rgba(139,92,246,.15)', textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#F5F3FF' }}>{totalRefs}</div>
          <div style={{ fontSize: '.75rem', color: '#A5A3B8', marginTop: 4 }}>إحالة كلية</div>
        </div>
        <div style={{ padding: 18, borderRadius: 16, background: 'rgba(20,18,28,.6)', border: '1px solid rgba(139,92,246,.15)', textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#FBBF24' }}>{totalBonus}</div>
          <div style={{ fontSize: '.75rem', color: '#A5A3B8', marginTop: 4 }}>نقاط موزعة</div>
        </div>
      </div>

      {totalRefs === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#A5A3B8', background: 'rgba(20,18,28,.5)', borderRadius: 16 }}>
          مفيش إحالات لسه
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 8, maxWidth: 900 }}>
          {(refs ?? []).map((r: any) => (
            <div key={r.id} style={{ padding: 14, borderRadius: 12, background: 'rgba(20,18,28,.6)', border: '1px solid rgba(139,92,246,.15)', display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: 12, alignItems: 'center' }}>
              <span style={{ color: '#A855F7', fontWeight: 900 }}>→</span>
              <div>
                <strong style={{ color: '#F5F3FF', display: 'block', marginBottom: 2, fontSize: '.9rem' }}>
                  {r.referrer?.display_name ?? 'مستخدم'}
                </strong>
                <span style={{ fontSize: '.72rem', color: '#A5A3B8' }}>
                  دعي {r.referred?.display_name ?? 'مستخدم'} · كود {r.code}
                </span>
              </div>
              <span style={{ color: '#FBBF24', fontWeight: 900, fontSize: '.85rem' }}>+{r.bonus_points}</span>
              <span style={{ color: '#6B6880', fontSize: '.72rem' }}>
                {new Date(r.created_at).toLocaleDateString('ar-EG')}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
