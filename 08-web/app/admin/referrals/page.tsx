import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { updateReferralSettings } from './actions'
import ReferralsSettingsForm from './ReferralsSettingsForm'
import './referrals.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'الإحالات' }

type Ref = {
  id: string
  code: string
  bonus_points: number | null
  created_at: string
  referrer: { display_name: string | null; phone: string | null; referral_code: string | null } | null
  referred: { display_name: string | null; phone: string | null } | null
}

export default async function AdminReferralsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/admin/login')
  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userData.user.id)
    .maybeSingle()
  if (roleRow?.role !== 'super_admin' && roleRow?.role !== 'admin') redirect('/')

  const sp = await searchParams
  const q = (sp.q ?? '').trim().toLowerCase()

  const { data: settingsData } = await supabase
    .from('referral_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle()

  const { data: refs } = await supabase
    .from('referrals')
    .select(`
      id,code,bonus_points,created_at,
      referrer:profiles!referrals_referrer_id_fkey (display_name,phone,referral_code),
      referred:profiles!referrals_referred_id_fkey (display_name,phone)
    `)
    .order('created_at', { ascending: false })
    .limit(300)

  const rows = (refs ?? []) as unknown as Ref[]
  const filtered = q
    ? rows.filter((r) => {
        const hay = [
          r.referrer?.display_name,
          r.referrer?.phone,
          r.referred?.display_name,
          r.referred?.phone,
          r.code,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return hay.includes(q)
      })
    : rows

  const totalRefs = rows.length
  const totalBonus = rows.reduce((s, r) => s + (r.bonus_points ?? 0), 0)
  const uniqueReferrers = new Set(rows.map((r) => r.referrer?.phone).filter(Boolean)).size

  // Top referrers
  const byReferrer = new Map<string, { name: string; phone: string; count: number; points: number }>()
  for (const r of rows) {
    const key = r.referrer?.phone ?? 'unknown'
    const entry = byReferrer.get(key) ?? {
      name: r.referrer?.display_name ?? 'غير معروف',
      phone: r.referrer?.phone ?? '—',
      count: 0,
      points: 0,
    }
    entry.count++
    entry.points += r.bonus_points ?? 0
    byReferrer.set(key, entry)
  }
  const topReferrers = [...byReferrer.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const settings = settingsData ?? {
    referrer_bonus: 50,
    referred_bonus: 25,
    min_days_between: 0,
    max_referrals_per_user: null,
    require_verification: false,
    is_active: true,
  }

  return (
    <section>
      <header className="admin-header">
        <div className="admin-header__info">
          <span className="admin-header__kicker">REFERRALS</span>
          <h1 className="admin-header__title">🎁 الإحالات</h1>
          <p className="admin-header__subtitle">
            {totalRefs} إحالة · {totalBonus} نقطة موزعة · {uniqueReferrers} داعي
          </p>
        </div>
      </header>

      {/* Stats */}
      <div className="ref-stats">
        <div className="ref-stat ref-stat--purple">
          <span className="ref-stat__num">{totalRefs}</span>
          <span className="ref-stat__label">إحالة كلية</span>
        </div>
        <div className="ref-stat ref-stat--gold">
          <span className="ref-stat__num">{totalBonus}</span>
          <span className="ref-stat__label">نقاط موزعة</span>
        </div>
        <div className="ref-stat ref-stat--purple">
          <span className="ref-stat__num">{uniqueReferrers}</span>
          <span className="ref-stat__label">دعاة نشطين</span>
        </div>
        <div className="ref-stat ref-stat--blue">
          <span className="ref-stat__num">
            {settings.referrer_bonus}+{settings.referred_bonus}
          </span>
          <span className="ref-stat__label">مكافأة/إحالة</span>
        </div>
      </div>

      {/* Settings */}
      <section className="ref-settings">
        <h2 className="ref-section__title">⚙️ إعدادات النظام</h2>
        <ReferralsSettingsForm initial={settings as any} action={updateReferralSettings} />
      </section>

      {/* Top referrers */}
      {topReferrers.length > 0 && (
        <section className="ref-top">
          <h2 className="ref-section__title">🏆 أفضل الدعاة</h2>
          <div className="ref-top-list">
            {topReferrers.map((t, i) => (
              <div key={t.phone} className="ref-top-item">
                <span className="ref-top-item__rank">#{i + 1}</span>
                <div className="ref-top-item__info">
                  <span className="ref-top-item__name">{t.name}</span>
                  <span className="ref-top-item__phone">{t.phone}</span>
                </div>
                <span className="ref-top-item__count">{t.count} إحالة</span>
                <span className="ref-top-item__points">+{t.points} نقطة</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Search + List */}
      <section className="ref-list-section">
        <h2 className="ref-section__title">📋 سجل الإحالات</h2>
        <form className="ref-search" action="/admin/referrals" method="get">
          <input
            type="text"
            name="q"
            placeholder="🔎 ابحث بالاسم أو الرقم أو الكود..."
            defaultValue={sp.q ?? ''}
          />
        </form>

        {filtered.length === 0 ? (
          <div className="admin-empty">
            <span className="admin-empty__emoji">📭</span>
            <h2 className="admin-empty__title">مفيش إحالات</h2>
            <p className="admin-empty__msg">
              {q ? 'مفيش نتائج للبحث ده' : 'لما العملاء يبدأوا يدعوا صحابهم، هيظهروا هنا'}
            </p>
          </div>
        ) : (
          <div className="ref-list">
            {filtered.map((r) => (
              <article key={r.id} className="ref-row">
                <div className="ref-row__arrow">→</div>
                <div className="ref-row__info">
                  <span className="ref-row__referrer">
                    {r.referrer?.display_name ?? 'مستخدم'}
                  </span>
                  <span className="ref-row__sub">
                    دعي {r.referred?.display_name ?? 'مستخدم'}
                  </span>
                </div>
                <span className="ref-row__code">كود {r.code}</span>
                <span className="ref-row__points">+{r.bonus_points ?? 0}</span>
                <span className="ref-row__date">
                  {new Date(r.created_at).toLocaleDateString('ar-EG')}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  )
}
