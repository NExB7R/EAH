import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { createReward, toggleReward, deleteReward } from './actions'
import RewardsTabs from './RewardsTabs'
import './rewards.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'إدارة المكافآت' }

const CATS = [
  { v: 'voucher', l: '🎟️ قسيمة' },
  { v: 'discount', l: 'خصم' },
  { v: 'freebie', l: 'هدية' },
  { v: 'delivery', l: 'توصيل' },
  { v: 'badge', l: '🏆 شارة' },
  { v: 'frame', l: 'إطار' },
  { v: 'feature', l: 'ميزة' },
  { v: 'cash', l: '💵 فلوس' },
]

const VTYPES = [
  { v: 'none', l: 'بدون قيمة' },
  { v: 'EGP', l: 'جنيه' },
  { v: 'percent', l: 'نسبة %' },
  { v: 'free', l: 'مجانًا' },
]

export default async function AdminRewardsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const supabase = await createClient()
  const { data: u } = await supabase.auth.getUser()
  if (!u.user) redirect('/admin/login')
  const { data: r } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', u.user.id)
    .maybeSingle()
  if (r?.role !== 'super_admin' && r?.role !== 'admin') redirect('/')

  const sp = await searchParams
  const tab = sp.tab ?? 'catalog'

  const { data: rewards } = await supabase
    .from('reward_catalog')
    .select('*')
    .order('sort_order')
    .order('points_cost')

  const { data: redemptions } = await supabase
    .from('reward_redemptions')
    .select(`
      id, user_id, reward_id, points_spent, status, voucher_code, admin_note,
      created_at, reviewed_at,
      reward:reward_catalog(title, emoji, category),
      user:profiles!reward_redemptions_user_id_fkey(display_name, phone)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  const pendingCount =
    (redemptions ?? []).filter((x: any) => x.status === 'pending').length
  const activeCount = (rewards ?? []).filter((x: any) => x.is_active).length

  return (
    <section>
      <header className="admin-header">
        <div className="admin-header__info">
          <span className="admin-header__kicker">المكافآت</span>
          <h1 className="admin-header__title">إدارة المكافآت</h1>
          <p className="admin-header__subtitle">
            {rewards?.length ?? 0} مكافأة ({activeCount} نشطة)
            {pendingCount > 0 && ` • ${pendingCount} طلب قيد المراجعة`}
          </p>
        </div>
      </header>

      <RewardsTabs active={tab} pendingCount={pendingCount} />

      {tab === 'catalog' && (
        <>
          <section className="rew-create">
            <h2 className="rew-create__title">➕ إضافة مكافأة جديدة</h2>
            <form action={createReward} className="rew-create__form">
              <input name="title" placeholder="العنوان" required className="rew-input" />
              <input name="emoji" placeholder="" maxLength={4} className="rew-input" />
              <select name="category" className="rew-input">
                {CATS.map((c) => (
                  <option key={c.v} value={c.v}>{c.l}</option>
                ))}
              </select>
              <select name="value_type" className="rew-input">
                {VTYPES.map((v) => (
                  <option key={v.v} value={v.v}>{v.l}</option>
                ))}
              </select>
              <input name="value" type="number" placeholder="القيمة" className="rew-input" />
              <input name="points_cost" type="number" placeholder="تكلفة النقاط" required className="rew-input" />
              <input name="min_streak" type="number" placeholder="min streak" defaultValue="0" className="rew-input" />
              <input name="stock" type="number" placeholder="مخزون" className="rew-input" />
              <textarea name="description" placeholder="وصف" rows={1} className="rew-input rew-input--full" />
              <button type="submit" className="rew-btn rew-btn--primary">حفظ المكافأة</button>
            </form>
          </section>

          {rewards?.length === 0 ? (
            <div className="admin-empty">
              <span className="admin-empty__emoji"></span>
              <h2 className="admin-empty__title">لسه مفيش مكافآت</h2>
              <p className="admin-empty__msg">أضف أول مكافأة من فوق</p>
            </div>
          ) : (
            <div className="rew-list">
              {(rewards ?? []).map((rw: any) => (
                <article
                  key={rw.id}
                  className={`rew-item ${rw.is_active ? '' : 'is-inactive'}`}
                >
                  <span className="rew-item__emoji">{rw.emoji}</span>
                  <div className="rew-item__info">
                    <span className="rew-item__title">{rw.title}</span>
                    <span className="rew-item__meta">
                      {rw.category}
                      {rw.value
                        ? ` · ${rw.value}${rw.value_type === 'EGP' ? 'ج.م' : rw.value_type === 'percent' ? '%' : ''}`
                        : ''}
                      {rw.stock ? ` · مخزون: ${rw.stock}` : ''}
                    </span>
                  </div>
                  <span className="rew-item__cost">{rw.points_cost} نقطة</span>
                  <form action={toggleReward.bind(null, rw.id, !rw.is_active)}>
                    <button
                      type="submit"
                      className={`rew-btn ${rw.is_active ? 'rew-btn--on' : 'rew-btn--off'}`}
                    >
                      {rw.is_active ? '✓ مفعّل' : 'موقوف'}
                    </button>
                  </form>
                  <form action={deleteReward.bind(null, rw.id)}>
                    <button type="submit" className="rew-btn rew-btn--danger" aria-label="حذف">
                      🗑
                    </button>
                  </form>
                </article>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'redemptions' && (
        <RewardRedemptions redemptions={redemptions ?? []} />
      )}
    </section>
  )
}

// ═══ Redemptions sub-component (server) ═══
import { reviewRedemption } from './actions'

function RewardRedemptions({ redemptions }: { redemptions: any[] }) {
  if (redemptions.length === 0) {
    return (
      <div className="admin-empty">
        <span className="admin-empty__emoji">📭</span>
        <h2 className="admin-empty__title">مفيش طلبات استبدال</h2>
        <p className="admin-empty__msg">
          لما العملاء يستبدلوا نقاطهم بمكافآت، الطلبات هتظهر هنا
        </p>
      </div>
    )
  }

  return (
    <div className="rew-red-list">
      {redemptions.map((rd: any) => {
        const statusClass =
          rd.status === 'pending' ? 'pending'
          : rd.status === 'approved' ? 'approved'
          : rd.status === 'delivered' ? 'delivered'
          : 'rejected'
        return (
          <article key={rd.id} className={`rew-red rew-red--${statusClass}`}>
            <div className="rew-red__head">
              <span className="rew-red__emoji">{rd.reward?.emoji ?? ''}</span>
              <div className="rew-red__info">
                <span className="rew-red__title">{rd.reward?.title ?? 'مكافأة'}</span>
                <span className="rew-red__user">
                  {rd.user?.display_name ?? rd.user?.phone ?? 'مستخدم'}
                </span>
              </div>
              <span className={`rew-red__status rew-red__status--${statusClass}`}>
                {statusClass === 'pending' ? 'قيد المراجعة'
                : statusClass === 'approved' ? 'مقبول'
                : statusClass === 'delivered' ? 'تم التسليم'
                : 'مرفوض'}
              </span>
            </div>
            <div className="rew-red__meta">
              <span className="rew-red__chip">{rd.points_spent} نقطة</span>
              <span className="rew-red__chip">📅 {new Date(rd.created_at).toLocaleDateString('ar-EG')}</span>
              {rd.voucher_code && (
                <span className="rew-red__chip rew-red__chip--voucher">
                  🎟️ {rd.voucher_code}
                </span>
              )}
            </div>
            {rd.admin_note && (
              <div className="rew-red__note">{rd.admin_note}</div>
            )}
            {rd.status === 'pending' && (
              <form action={async (fd: FormData) => {
                'use server'
                const decision = String(fd.get('decision')) as any
                const note = String(fd.get('note') ?? '')
                const voucher = String(fd.get('voucher') ?? '')
                await reviewRedemption(rd.id, decision, note, voucher)
              }} className="rew-red__actions">
                <input name="voucher" placeholder="كود القسيمة (اختياري)" className="rew-input" />
                <input name="note" placeholder="ملاحظة" className="rew-input" />
                <button name="decision" value="approved" className="rew-btn rew-btn--primary">
                  قبول
                </button>
                <button name="decision" value="delivered" className="rew-btn rew-btn--on">
                  تم التسليم
                </button>
                <button name="decision" value="rejected" className="rew-btn rew-btn--danger">
                  رفض
                </button>
              </form>
            )}
          </article>
        )
      })}
    </div>
  )
}
