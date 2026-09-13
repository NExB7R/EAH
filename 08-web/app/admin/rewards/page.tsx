import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { createReward, toggleReward, deleteReward } from './actions'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'إدارة المكافآت | EAH Admin' }

const CATS = [
  { v: 'voucher', l: '🎟️ قسيمة' },
  { v: 'discount', l: '💰 خصم' },
  { v: 'freebie', l: '🎁 هدية' },
  { v: 'delivery', l: '🛵 توصيل' },
  { v: 'badge', l: '🏆 شارة' },
  { v: 'frame', l: '👑 إطار' },
  { v: 'feature', l: '🚀 ميزة' },
  { v: 'cash', l: '💵 فلوس' },
]

const VTYPES = [
  { v: 'none', l: 'بدون قيمة' },
  { v: 'EGP', l: 'جنيه' },
  { v: 'percent', l: 'نسبة %' },
  { v: 'free', l: 'مجانًا' },
]

export default async function AdminRewardsPage() {
  const supabase = await createClient()
  const { data: u } = await supabase.auth.getUser()
  if (!u.user) redirect('/admin/login')
  const { data: r } = await supabase.from('user_roles').select('role').eq('user_id', u.user.id).maybeSingle()
  if (r?.role !== 'super_admin') redirect('/')

  const { data: rewards } = await supabase.from('reward_catalog').select('*').order('sort_order').order('points_cost')

  return (
    <section>
      <header className="eah-admin-page-header">
        <div>
          <span className="eah-admin-kicker">REWARDS</span>
          <h1>🎁 إدارة المكافآت</h1>
          <p>{rewards?.length ?? 0} مكافأة</p>
        </div>
        <Link href="/admin" className="eah-admin-btn">← لوحة التحكم</Link>
      </header>

      {/* Create form */}
      <div style={{ padding: 20, borderRadius: 18, background: 'rgba(20,18,28,.6)', border: '1px solid rgba(139,92,246,.15)', marginBottom: 24, maxWidth: 900 }}>
        <h2 style={{ fontSize: '.95rem', fontWeight: 900, color: '#F5F3FF', margin: '0 0 14px' }}>➕ إضافة مكافأة</h2>
        <form action={createReward} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          <input name="title" placeholder="العنوان" required style={{ padding: 10, borderRadius: 10, background: 'rgba(10,8,16,.7)', border: '1px solid rgba(139,92,246,.2)', color: '#F5F3FF', fontFamily: 'inherit', fontSize: '.85rem', outline: 'none' }} />
          <input name="emoji" placeholder="🎁" maxLength={4} style={{ padding: 10, borderRadius: 10, background: 'rgba(10,8,16,.7)', border: '1px solid rgba(139,92,246,.2)', color: '#F5F3FF', fontFamily: 'inherit', fontSize: '.85rem', outline: 'none' }} />
          <select name="category" style={{ padding: 10, borderRadius: 10, background: 'rgba(10,8,16,.7)', border: '1px solid rgba(139,92,246,.2)', color: '#F5F3FF', fontFamily: 'inherit', fontSize: '.85rem', outline: 'none' }}>
            {CATS.map(c => <option key={c.v} value={c.v}>{c.l}</option>)}
          </select>
          <select name="value_type" style={{ padding: 10, borderRadius: 10, background: 'rgba(10,8,16,.7)', border: '1px solid rgba(139,92,246,.2)', color: '#F5F3FF', fontFamily: 'inherit', fontSize: '.85rem', outline: 'none' }}>
            {VTYPES.map(v => <option key={v.v} value={v.v}>{v.l}</option>)}
          </select>
          <input name="value" type="number" placeholder="القيمة (25، 10...)" style={{ padding: 10, borderRadius: 10, background: 'rgba(10,8,16,.7)', border: '1px solid rgba(139,92,246,.2)', color: '#F5F3FF', fontFamily: 'inherit', fontSize: '.85rem', outline: 'none' }} />
          <input name="points_cost" type="number" placeholder="التكلفة بالنقاط" required style={{ padding: 10, borderRadius: 10, background: 'rgba(10,8,16,.7)', border: '1px solid rgba(139,92,246,.2)', color: '#F5F3FF', fontFamily: 'inherit', fontSize: '.85rem', outline: 'none' }} />
          <input name="min_streak" type="number" placeholder="min streak" defaultValue="0" style={{ padding: 10, borderRadius: 10, background: 'rgba(10,8,16,.7)', border: '1px solid rgba(139,92,246,.2)', color: '#F5F3FF', fontFamily: 'inherit', fontSize: '.85rem', outline: 'none' }} />
          <input name="stock" type="number" placeholder="مخزون (اختياري)" style={{ padding: 10, borderRadius: 10, background: 'rgba(10,8,16,.7)', border: '1px solid rgba(139,92,246,.2)', color: '#F5F3FF', fontFamily: 'inherit', fontSize: '.85rem', outline: 'none' }} />
          <textarea name="description" placeholder="وصف" rows={1} style={{ gridColumn: 'span 3', padding: 10, borderRadius: 10, background: 'rgba(10,8,16,.7)', border: '1px solid rgba(139,92,246,.2)', color: '#F5F3FF', fontFamily: 'inherit', fontSize: '.85rem', outline: 'none', resize: 'vertical' }} />
          <button type="submit" style={{ gridColumn: 'span 1', padding: 10, borderRadius: 10, background: 'linear-gradient(135deg,#8B5CF6,#A855F7)', border: 'none', color: '#fff', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>حفظ</button>
        </form>
      </div>

      {/* Rewards list */}
      <div style={{ display: 'grid', gap: 10, maxWidth: 900 }}>
        {(rewards ?? []).map((rw: any) => (
          <div key={rw.id} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto auto auto', gap: 14, alignItems: 'center', padding: 14, borderRadius: 14, background: 'rgba(20,18,28,.6)', border: '1px solid rgba(139,92,246,.15)', opacity: rw.is_active ? 1 : .5 }}>
            <span style={{ fontSize: '1.6rem' }}>{rw.emoji}</span>
            <div>
              <strong style={{ color: '#F5F3FF', display: 'block', marginBottom: 2 }}>{rw.title}</strong>
              <span style={{ fontSize: '.72rem', color: '#A5A3B8' }}>{rw.category}{rw.value ? ` · ${rw.value}${rw.value_type === 'EGP' ? 'ج.م' : rw.value_type === 'percent' ? '%' : ''}` : ''}</span>
            </div>
            <span style={{ color: '#FBBF24', fontWeight: 900, fontSize: '.9rem' }}>{rw.points_cost} نقطة</span>
            <form action={toggleReward.bind(null, rw.id, !rw.is_active)}>
              <button type="submit" style={{ padding: '6px 12px', borderRadius: 8, background: rw.is_active ? 'rgba(34,197,94,.15)' : 'rgba(107,104,128,.2)', border: '1px solid rgba(139,92,246,.2)', color: rw.is_active ? '#4ADE80' : '#A5A3B8', fontSize: '.72rem', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
                {rw.is_active ? 'مفعّل' : 'موقوف'}
              </button>
            </form>
            <form action={deleteReward.bind(null, rw.id)}>
              <button type="submit" style={{ padding: '6px 10px', borderRadius: 8, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', color: '#FCA5A5', fontSize: '.72rem', cursor: 'pointer', fontFamily: 'inherit' }}>🗑</button>
            </form>
          </div>
        ))}
      </div>
    </section>
  )
}
