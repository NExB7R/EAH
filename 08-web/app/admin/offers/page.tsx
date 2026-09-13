import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'كل العروض | EAH Admin' }

type Offer = {
  id: string
  business_id: string
  title: string
  description: string | null
  price: number | null
  image_url: string | null
  teaser_image_path: string | null
  starts_at: string | null
  ends_at: string | null
  is_published: boolean
  created_at: string
  businesses: { name: string; slug: string; business_type: string } | null
}

export default async function AllOffersPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/admin/login')

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userData.user.id)
    .maybeSingle()
  if (roleRow?.role !== 'super_admin') redirect('/')

  const { data, error } = await supabase
    .from('offers')
    .select('id,business_id,title,description,price,image_url,teaser_image_path,starts_at,ends_at,is_published,created_at,businesses(name,slug,business_type)')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    return (
      <div className="admin-empty">
        <span className="admin-empty__emoji">⚠️</span>
        <h2 className="admin-empty__title">حصل خطأ</h2>
        <p className="admin-empty__msg">{error.message}</p>
      </div>
    )
  }

  const rows = (data ?? []) as unknown as Offer[]

  return (
    <>
      <div className="admin-header">
        <div className="admin-header__info">
          <span className="admin-header__kicker">ALL OFFERS</span>
          <h1 className="admin-header__title">🔥 كل العروض</h1>
          <p className="admin-header__subtitle">
            {rows.length} عرض في كل الأنشطة
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="admin-empty">
          <span className="admin-empty__emoji">🔥</span>
          <h2 className="admin-empty__title">لسه مفيش عروض</h2>
          <p className="admin-empty__msg">اذهب لأي مكان وأضف أول عرض</p>
          <Link href="/admin/businesses" className="admin-btn admin-btn--primary">
            🏪 الأنشطة
          </Link>
        </div>
      ) : (
        <div className="admin-grid admin-grid--cards">
          {rows.map((o) => {
            const img = o.image_url || o.teaser_image_path
            const isActive =
              o.is_published &&
              (!o.starts_at || new Date(o.starts_at) <= new Date()) &&
              (!o.ends_at || new Date(o.ends_at) >= new Date())

            return (
              <article key={o.id} className="admin-biz">
                <div className="admin-biz__head">
                  <div
                    className="admin-biz__thumb"
                    style={{
                      backgroundImage: img ? `url(${img})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      fontSize: img ? 0 : undefined,
                    }}
                  >
                    {!img && '🎁'}
                  </div>
                  <div className="admin-biz__meta">
                    <h3 className="admin-biz__name">{o.title}</h3>
                    {o.businesses && (
                      <span className="admin-biz__slug">
                        🏪 {o.businesses.name}
                      </span>
                    )}
                    {o.price !== null && (
                      <span style={{ fontSize: '0.85rem', color: 'var(--eah-gold)', fontWeight: 900 }}>
                        {o.price} ج.م
                      </span>
                    )}
                    <div className="admin-biz__badges">
                      {isActive ? (
                        <span className="admin-biz__badge admin-biz__badge--open">✅ نشط</span>
                      ) : o.is_published ? (
                        <span className="admin-biz__badge">⏰ مش نشط</span>
                      ) : (
                        <span className="admin-biz__badge">🚫 غير منشور</span>
                      )}
                      {o.ends_at && (
                        <span className="admin-biz__badge">
                          ينتهي: {new Date(o.ends_at).toLocaleDateString('ar-EG')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {o.businesses && (
                  <div className="admin-biz__actions">
                    <Link
                      href={`/admin/businesses/${o.businesses.slug}/offers/${o.id}/edit`}
                      className="admin-btn admin-btn--sm admin-btn--primary"
                    >
                      ✏️ تعديل
                    </Link>
                    <Link
                      href={`/businesses/${o.businesses.slug}`}
                      target="_blank"
                      className="admin-btn admin-btn--sm"
                    >
                      👁 مشاهدة
                    </Link>
                    <Link
                      href={`/admin/businesses/${o.businesses.slug}/offers`}
                      className="admin-btn admin-btn--sm"
                    >
                      🔥 عروض المكان
                    </Link>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </>
  )
}
