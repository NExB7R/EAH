import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import BusinessActions from '@/components/admin/business-actions'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'الأنشطة | EAH Admin' }

type Business = {
  id: string
  name: string
  slug: string
  business_type: string
  city: string | null
  area: string | null
  is_open: boolean
  is_featured: boolean
  is_published: boolean
  hook: string | null
}

const TYPE_LABEL: Record<string, string> = {
  restaurant: '🍽️ مطعم',
  pharmacy: '💊 صيدلية',
  delivery_office: '🛵 توصيل',
}

const TYPE_EMOJI: Record<string, string> = {
  restaurant: '🍽️',
  pharmacy: '💊',
  delivery_office: '🛵',
}

export default async function AdminBusinessesPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('businesses')
    .select('id,name,slug,business_type,city,area,is_open,is_featured,is_published,hook')
    .order('updated_at', { ascending: false })
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

  const rows = (data ?? []) as Business[]

  return (
    <>
      <div className="admin-header">
        <div className="admin-header__info">
          <span className="admin-header__kicker">BUSINESS CONTROL</span>
          <h1 className="admin-header__title">🏪 إدارة الأنشطة</h1>
          <p className="admin-header__subtitle">
            {rows.length} نشاط — كل عمليات التحكم في مكان واحد
          </p>
        </div>
        <div className="admin-header__actions">
          <Link href="/admin/businesses/new" className="admin-btn admin-btn--primary">
            ➕ إضافة مكان جديد
          </Link>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="admin-empty">
          <span className="admin-empty__emoji">🏪</span>
          <h2 className="admin-empty__title">لسه مفيش أنشطة</h2>
          <p className="admin-empty__msg">ابدأ بإضافة أول مطعم أو صيدلية أو </p>
          <Link href="/admin/businesses/new" className="admin-btn admin-btn--primary">
            ➕ إضافة أول مكان
          </Link>
        </div>
      ) : (
        <div className="admin-grid admin-grid--cards">
          {rows.map((b) => (
            <article key={b.id} className="admin-biz">
              <div className="admin-biz__head">
                <div className="admin-biz__thumb">
                  {TYPE_EMOJI[b.business_type] ?? '🏪'}
                </div>
                <div className="admin-biz__meta">
                  <h3 className="admin-biz__name">{b.name}</h3>
                  <span className="admin-biz__slug">/{b.slug}</span>
                  <span className="admin-biz__area">
                    📍 {[b.area, b.city].filter(Boolean).join(' • ') || 'لم يُحدد'}
                  </span>
                  {b.hook && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        color: 'var(--eah-gold)',
                        fontStyle: 'italic',
                        marginTop: 2,
                      }}
                    >
                      ✨ {b.hook}
                    </span>
                  )}
                  <div className="admin-biz__badges">
                    <span className="admin-biz__badge admin-biz__badge--type">
                      {TYPE_LABEL[b.business_type] ?? b.business_type}
                    </span>
                    {b.is_featured && (
                      <span className="admin-biz__badge admin-biz__badge--featured">
                        ⭐ مميز
                      </span>
                    )}
                    {b.is_published && (
                      <span className="admin-biz__badge admin-biz__badge--published">
                        📢 منشور
                      </span>
                    )}
                    {b.is_open && (
                      <span className="admin-biz__badge admin-biz__badge--open">
                        ✅ مفتوح
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <BusinessActions
                id={b.id}
                slug={b.slug}
                is_featured={b.is_featured}
                is_published={b.is_published}
                is_open={b.is_open}
              />
            </article>
          ))}
        </div>
      )}
    </>
  )
}
