import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import { IcCheck, IcBan, IcInbox, IcClock } from '@/components/eah-icons'
import './pending.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'طلباتي المعلقة' }

const ACTION_LABEL: Record<string, string> = {
  'business.update': 'تعديل نشاط',
  'business.delete': 'حذف نشاط',
  'business.images_change': 'تغيير صور',
  'offer.update': 'تعديل عرض',
  'offer.delete': 'حذف عرض',
  'review.hide': 'إخفاء تقييم',
  'review.delete': 'حذف تقييم',
  'profile.update': 'تعديل بروفايل',
}

function timeAgo(iso: string): string {
  const d = Date.now() - new Date(iso).getTime()
  const m = Math.floor(d / 60000)
  if (m < 1) return 'الآن'
  if (m < 60) return `قبل ${m} د`
  const h = Math.floor(m / 60)
  if (h < 24) return `قبل ${h} س`
  return `قبل ${Math.floor(h / 24)} يوم`
}

export default async function MerchantPendingPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>
}) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/auth?next=/merchant/pending')

  const sp = await searchParams

  const { data: rows } = await supabase
    .from('pending_changes')
    .select('id,action,entity_type,entity_id,payload,status,reviewed_at,review_note,created_at')
    .eq('requested_by', userData.user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const items = rows ?? []
  const pendingCount = items.filter((x: any) => x.status === 'pending').length
  const approvedCount = items.filter((x: any) => x.status === 'approved').length
  const rejectedCount = items.filter((x: any) => x.status === 'rejected').length

  return (
    <>
      <FloatingCapsuleHeader />
      <main className="mpage">
        <div className="mpage__head">
          <div>
            <span className="mpage__kicker">طلبات التعديل</span>
            <h1 className="mpage__title">طلباتي المعلقة</h1>
            <p className="mpage__sub">
              كل تعديل بيروح للفريق للمراجعة قبل النشر
            </p>
          </div>
          <Link href="/merchant" className="admin-btn admin-btn--ghost">← رجوع</Link>
        </div>

        {sp.submitted === '1' && (
          <div className="mpending__success">
            <IcCheck /> تم إرسال طلبك — الفريق هيراجعه قريب
          </div>
        )}

        <div className="mpending__stats">
          <div className="mpending__stat">
            <span className="mpending__stat-num" style={{ color: '#FBBF24' }}>{pendingCount}</span>
            <span className="mpending__stat-label">معلق</span>
          </div>
          <div className="mpending__stat">
            <span className="mpending__stat-num" style={{ color: '#86EFAC' }}>{approvedCount}</span>
            <span className="mpending__stat-label">معتمد</span>
          </div>
          <div className="mpending__stat">
            <span className="mpending__stat-num" style={{ color: '#FCA5A5' }}>{rejectedCount}</span>
            <span className="mpending__stat-label">مرفوض</span>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="mpending__empty">
            <IcInbox />
            <h3>مفيش طلبات لسه</h3>
            <p>لما تعدّل بيانات نشاطك، هتلاقي حالة الطلب هنا.</p>
          </div>
        ) : (
          <div className="mpending__list">
            {items.map((item: any) => (
              <article key={item.id} className={`mpending__row mpending__row--${item.status}`}>
                <header className="mpending__row-head">
                  <span className="mpending__action">
                    {ACTION_LABEL[item.action] ?? item.action}
                  </span>
                  <span className="mpending__time">{timeAgo(item.created_at)}</span>
                </header>
                <div className="mpending__status">
                  {item.status === 'pending' && <><IcClock /> بانتظار المراجعة</>}
                  {item.status === 'approved' && <><IcCheck /> اتعمد</>}
                  {item.status === 'rejected' && <><IcBan /> اترفض</>}
                </div>
                {item.review_note && (
                  <div className="mpending__note">
                    <strong>ملاحظة الفريق:</strong> {item.review_note}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
