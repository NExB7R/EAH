import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { IcBan } from '@/components/eah-icons'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'العروض' }

export default async function OffersPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/admin/login')

  const { data: roleRow } = await supabase
    .from('user_roles').select('role').eq('user_id', userData.user.id).maybeSingle()
  if (roleRow?.role !== 'super_admin') redirect('/')

  const { data: biz } = await supabase
    .from('businesses')
    .select('id,name,slug')
    .eq('slug', slug)
    .maybeSingle()
  if (!biz) notFound()

  const { data: offers } = await supabase
    .from('offers')
    .select('id,title,description,price,image_url,teaser_image_path,starts_at,ends_at,is_published,created_at')
    .eq('business_id', biz.id)
    .order('created_at', { ascending: false })

  const rows = offers ?? []

  return (
    <>
      <div className="admin-header">
        <div className="admin-header__info">
          <span className="admin-header__kicker">العروض</span>
          <h1 className="admin-header__title">عروض: {biz.name}</h1>
          <p className="admin-header__subtitle">
            {rows.length} عرض — تظهر للعملاء في الصفحة الرئيسية وصفحة المكان
          </p>
        </div>
        <div className="admin-header__actions">
          <Link href={`/admin/businesses/${biz.slug}/edit`} className="admin-btn admin-btn--ghost">← تعديل المكان</Link>
          <Link href={`/admin/businesses/${biz.slug}/offers/new`} className="admin-btn admin-btn--primary">عرض جديد</Link>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="admin-empty">
          <span className="admin-empty__emoji"></span>
          <h2 className="admin-empty__title">لسه مفيش عروض</h2>
          <p className="admin-empty__msg">أضف أول عرض لجذب العملاء</p>
          <Link href={`/admin/businesses/${biz.slug}/offers/new`} className="admin-btn admin-btn--primary">إضافة عرض</Link>
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
                    {!img && ''}
                  </div>
                  <div className="admin-biz__meta">
                    <h3 className="admin-biz__name">{o.title}</h3>
                    {o.description && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--eah-text-3)' }}>
                        {o.description.slice(0, 60)}
                      </span>
                    )}
                    {o.price !== null && o.price !== undefined && (
                      <span style={{ fontSize: '0.85rem', color: 'var(--eah-gold)', fontWeight: 900 }}>
                        {o.price} ج.م
                      </span>
                    )}
                    <div className="admin-biz__badges">
                      {isActive ? (
                        <span className="admin-biz__badge admin-biz__badge--open">نشط</span>
                      ) : o.is_published ? (
                        <span className="admin-biz__badge">⏰ مش نشط الآن</span>
                      ) : (
                        <span className="admin-biz__badge"><IcBan /> غير منشور</span>
                      )}
                      {o.ends_at && (
                        <span className="admin-biz__badge">
                          ينتهي: {new Date(o.ends_at).toLocaleDateString('ar-EG')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="admin-biz__actions">
                  <Link
                    href={`/admin/businesses/${biz.slug}/offers/${o.id}/edit`}
                    className="admin-btn admin-btn--sm admin-btn--primary"
                  >
                    تعديل
                  </Link>
                  <Link
                    href={`/businesses/${biz.slug}`}
                    target="_blank"
                    className="admin-btn admin-btn--sm"
                  >
                    عرض في المكان
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </>
  )
}
