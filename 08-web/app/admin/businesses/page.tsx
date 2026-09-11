import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'

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
}

const typeLabel: Record<string, string> = {
  restaurant: 'مطعم',
  pharmacy: 'صيدلية',
  supermarket: 'ماركت',
  delivery_office: 'مكتب توصيل',
  other: 'خدمة',
}

export default async function AdminBusinessesPage() {
  const supabase = await createClient()
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('id,name,slug,business_type,city,area,is_open,is_featured,is_published')
    .order('updated_at', { ascending: false })
    .limit(100)

  if (error) {
    return <section><h1>الأنشطة</h1><p className="lead">حصل خطأ أثناء تحميل الأنشطة: {error.message}</p></section>
  }

  const rows = (businesses ?? []) as Business[]

  return (
    <section>
      <header className="eah-admin-header">
        <div>
          <span className="eah-admin-kicker">BUSINESS CONTROL</span>
          <h1>الأنشطة</h1>
          <p>اختار النشاط وعدّل بياناته أو افتح تصميم صفحته مباشرة.</p>
        </div>
        <Link href="/admin/businesses/new" className="eah-admin-primary">+ إضافة نشاط</Link>
      </header>

      <div className="eah-admin-toolbar">
        <input className="eah-admin-search" placeholder="ابحث باسم النشاط أو المنطقة…" />
        <span className="eah-admin-badge">{rows.length} نشاط ظاهر</span>
      </div>

      <div className="eah-admin-business-list">
        {rows.length === 0 ? (
          <div className="eah-admin-command-card">
            <strong>لسه مفيش أنشطة</strong>
            <span>من هنا هنبدأ ندخل المطاعم والصيدليات والماركت ومكاتب التوصيل.</span>
          </div>
        ) : rows.map((business) => (
          <article key={business.id} className="eah-admin-business-card">
            <div>
              <div className="eah-admin-business-meta">
                <span className="eah-admin-business-name">{business.name}</span>
                <span className="eah-admin-badge">{typeLabel[business.business_type] ?? business.business_type}</span>
                {business.is_featured && <span className="eah-admin-badge">مميز</span>}
                {business.is_published && <span className="eah-admin-badge live">منشور</span>}
                {business.is_open && <span className="eah-admin-badge live">مفتوح</span>}
              </div>
              <div className="eah-admin-business-sub">
                {[business.area, business.city].filter(Boolean).join(' • ') || 'الموقع لم يُحدد بعد'}
              </div>
            </div>
            <div className="eah-admin-actions">
              <Link className="eah-admin-btn" href={`/admin/businesses/${business.slug}/edit`}>✏️ تعديل سريع</Link>
              <Link className="eah-admin-btn primary" href={`/admin/businesses/${business.slug}/design`}>🎨 تصميم الصفحة</Link>
              <Link className="eah-admin-btn" href={`/businesses/${business.slug}`}>مشاهدة ↗</Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
