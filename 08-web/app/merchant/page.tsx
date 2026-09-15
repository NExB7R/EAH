import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { getMerchantContext } from '@/lib/admin/merchant-guard'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import './merchant.css'
import SiteFooter from '@/components/site-footer'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'لوحة النشاط' }

const TYPE_EMOJI: Record<string, string> = {
  restaurant: '🍽️',
  pharmacy: '💊',
  delivery_office: '🛵',
}

const TYPE_LABEL: Record<string, string> = {
  restaurant: 'مطعم',
  pharmacy: 'صيدلية',
  delivery_office: 'توصيل',
}

export default async function MerchantDashboard() {
  const { user, businesses } = await getMerchantContext()

  return (
    <>
      <FloatingCapsuleHeader />
      <main className="mpage">
        <div className="mpage__head">
          <div>
            <span className="mpage__kicker">MERCHANT</span>
            <h1 className="mpage__title">🏪 لوحة النشاط</h1>
            <p className="mpage__sub">
              مرحبًا {user.email?.split('@')[0] ?? 'صاحب النشاط'} — إدارة كل أنشطتك من هنا
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link href="/merchant/orders" className="admin-btn admin-btn--gold">
              🛒 الطلبات
            </Link>
            <Link href="/merchant/apply" className="admin-btn admin-btn--primary">
              ➕ أضف نشاط جديد
            </Link>
          </div>
        </div>

        {businesses.length === 0 ? (
          <div className="admin-empty">
            <span className="admin-empty__emoji">🏪</span>
            <h2 className="admin-empty__title">لسه مسجلتش أي نشاط</h2>
            <p className="admin-empty__msg">سجّل مطعمك أو صيدليتك أو محلك واحنا هنتواصل معاك</p>
            <Link href="/merchant/apply" className="admin-btn admin-btn--primary">
              ➕ سجّل نشاطك
            </Link>
          </div>
        ) : (
          <div className="mpage__grid">
            {businesses.map((b) => (
              <article key={b.id} className="mbiz">
                <div className="mbiz__head">
                  <div className="mbiz__icon">{TYPE_EMOJI[b.business_type] ?? '🏪'}</div>
                  <div className="mbiz__meta">
                    <h3 className="mbiz__name">{b.name}</h3>
                    <span className="mbiz__slug">/{b.slug}</span>
                    <span className="mbiz__area">
                      📍 {[b.area, b.city].filter(Boolean).join(' • ') || 'لم يُحدد'}
                    </span>
                  </div>
                </div>

                <div className="mbiz__badges">
                  <span className="mbiz__badge mbiz__badge--type">
                    {TYPE_LABEL[b.business_type]}
                  </span>
                  {b.is_featured && <span className="mbiz__badge mbiz__badge--featured">⭐ مميز</span>}
                  {b.is_published && <span className="mbiz__badge mbiz__badge--published">📢 منشور</span>}
                  {b.is_open && <span className="mbiz__badge mbiz__badge--open">✅ مفتوح</span>}
                </div>

                <div className="mbiz__actions">
                  <Link href={`/merchant/businesses/${b.slug}/edit`} className="admin-btn admin-btn--sm admin-btn--primary">
                    ✏️ تعديل
                  </Link>
                  <Link href={`/merchant/businesses/${b.slug}/report`} className="admin-btn admin-btn--sm">
                    📊 إحصائيات
                  </Link>
                  <Link href="/merchant/orders" className="admin-btn admin-btn--sm">
                    🛒 الطلبات
                  </Link>
                  <Link href={`/businesses/${b.slug}`} target="_blank" className="admin-btn admin-btn--sm">
                    👁 عرض ↗
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
