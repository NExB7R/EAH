import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { IcBan } from '@/components/eah-icons'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'كل العروض' }

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

const TYPE_EMOJI: Record<string, string> = {
  restaurant: '',
  pharmacy: '',
  delivery_office: '',
}

export default async function AllOffersPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/admin/login')

  const { data: roleRow } = await supabase
    .from('user_roles').select('role').eq('user_id', userData.user.id).maybeSingle()
  if (roleRow?.role !== 'super_admin') redirect('/')

  const { data, error } = await supabase
    .from('offers')
    .select('id,business_id,title,description,price,image_url,teaser_image_path,starts_at,ends_at,is_published,created_at,businesses(name,slug,business_type)')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    return (
      <div className="admin-empty">
        <span className="admin-empty__emoji"></span>
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
          <span className="admin-header__kicker">كل العروض</span>
          <h1 className="admin-header__title">كل العروض</h1>
          <p className="admin-header__subtitle">{rows.length} عرض في كل الأنشطة</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="admin-empty">
          <span className="admin-empty__emoji"></span>
          <h2 className="admin-empty__title">لسه مفيش عروض</h2>
          <p className="admin-empty__msg">اذهب لأي مكان وأضف أول عرض</p>
          <Link href="/admin/businesses" className="admin-btn admin-btn--primary">الأنشطة</Link>
        </div>
      ) : (
        <div className="offers-grid">
          {rows.map((o) => {
            const img = o.image_url || o.teaser_image_path
            const isActive =
              o.is_published &&
              (!o.starts_at || new Date(o.starts_at) <= new Date()) &&
              (!o.ends_at || new Date(o.ends_at) >= new Date())

            return (
              <article key={o.id} className="offer-card">
                {/* صورة العرض */}
                <div
                  className="offer-card__image"
                  style={img ? { backgroundImage: `url(${img})` } : undefined}
                >
                  {!img && <span className="offer-card__image-placeholder"></span>}

                  {/* شارات */}
                  <div className="offer-card__badges">
                    {isActive ? (
                      <span className="offer-card__badge offer-card__badge--active">
                        
                        نشط
                      </span>
                    ) : o.is_published ? (
                      <span className="offer-card__badge offer-card__badge--pending">⏰ مش نشط</span>
                    ) : (
                      <span className="offer-card__badge offer-card__badge--off"><IcBan /> غير منشور</span>
                    )}
                  </div>

                  {/* السعر */}
                  {o.price !== null && (
                    <span className="offer-card__price">{o.price} ج.م</span>
                  )}
                </div>

                {/* المحتوى */}
                <div className="offer-card__body">
                  {/* اسم المطعم — بارز */}
                  {o.businesses && (
                    <Link
                      href={`/admin/businesses/${o.businesses.slug}/edit`}
                      className="offer-card__biz"
                    >
                      <span className="offer-card__biz-icon">
                        {TYPE_EMOJI[o.businesses.business_type] ?? ''}
                      </span>
                      <span className="offer-card__biz-name">{o.businesses.name}</span>
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="offer-card__biz-arrow">
                        <path d="M9 6l6 6-6 6" />
                      </svg>
                    </Link>
                  )}

                  {/* عنوان العرض */}
                  <h3 className="offer-card__title">{o.title}</h3>

                  {o.description && (
                    <p className="offer-card__desc">{o.description}</p>
                  )}

                  {o.ends_at && (
                    <div className="offer-card__meta">
                      <span className="offer-card__meta-item">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                        ينتهي {new Date(o.ends_at).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                  )}
                </div>

                {/* الأفعال */}
                {o.businesses && (
                  <div className="offer-card__actions">
                    <Link
                      href={`/admin/businesses/${o.businesses.slug}/offers/${o.id}/edit`}
                      className="offer-card__btn offer-card__btn--primary"
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline',verticalAlign:'middle',marginLeft:4}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> تعديل
                    </Link>
                    <Link
                      href={`/admin/businesses/${o.businesses.slug}/offers`}
                      className="offer-card__btn"
                    >
                      عروض المكان
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
