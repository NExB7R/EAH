import type { AdminBusiness } from '@/lib/data/admin-business'
import BusinessNotice from '@/components/business-notice'
import styles from './detail-tabs.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Admin Business: Overview Panel
// Read-only summary. Editing lives in the "تعديل" tab.
// ═══════════════════════════════════════════════════════════

const TYPE_LABEL: Record<string, string> = {
  restaurant: 'مطعم',
  pharmacy: 'صيدلية',
  supermarket: 'ماركت',
  delivery_office: 'توصيل',
  misc: 'أخرى',
}

const CONTACT_LABEL: Record<string, string> = {
  phone: 'هاتف',
  whatsapp: 'واتساب',
  complaints: 'شكاوى واقتراحات',
  facebook: 'فيسبوك',
  instagram: 'إنستجرام',
  website: 'موقع',
  manager: 'مسئول النشاط',
  shift_morning: 'شفت صباحي',
  shift_evening: 'شفت مسائي',
  additional: 'رقم إضافي',
}

export default function OverviewPanel({ biz }: { biz: AdminBusiness }) {
  const notice = biz.important_notice
    ? {
        text: biz.important_notice,
        severity: biz.notice_severity,
        expiresAt: biz.notice_expires_at,
      }
    : null

  const openMode =
    biz.open_now_override === true
      ? 'مفتوح (يدوي)'
      : biz.open_now_override === false
        ? 'مغلق مؤقتاً (يدوي)'
        : 'تلقائي حسب الساعات'

  const publishState = biz.is_published ? 'منشور' : biz.rejected_at ? 'مرفوض' : 'معلّق'

  return (
    <div className={styles.overviewWrap}>
      {notice && <BusinessNotice notice={notice} />}

      <div className={styles.cardGroup}>
        <h3 className={styles.cardGroupTitle}>الحالة</h3>
        <div className={styles.statRow}>
          <div className={styles.statCell}>
            <span className={styles.statLabel}>الفتح</span>
            <span className={styles.statValueSmall}>{openMode}</span>
          </div>
          <div className={styles.statCell}>
            <span className={styles.statLabel}>النشر</span>
            <span className={styles.statValueSmall}>{publishState}</span>
          </div>
          <div className={styles.statCell}>
            <span className={styles.statLabel}>النوع</span>
            <span className={styles.statValueSmall}>
              {TYPE_LABEL[biz.business_type] ?? biz.business_type}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.cardGroup}>
        <h3 className={styles.cardGroupTitle}>الإحصائيات</h3>
        <div className={styles.statRow}>
          <div className={styles.statCell}>
            <span className={styles.statLabel}>المصداقية</span>
            <span className={styles.statValue}>{biz.trust_score}</span>
          </div>
          <div className={styles.statCell}>
            <span className={styles.statLabel}>التقييم</span>
            <span className={styles.statValue}>{biz.rating_avg.toFixed(1)}</span>
          </div>
          <div className={styles.statCell}>
            <span className={styles.statLabel}>عدد التقييمات</span>
            <span className={styles.statValue}>{biz.rating_count}</span>
          </div>
          <div className={styles.statCell}>
            <span className={styles.statLabel}>الطلبات</span>
            <span className={styles.statValue}>{biz.successful_orders}</span>
          </div>
        </div>
      </div>

      {biz.owner && (
        <div className={styles.cardGroup}>
          <h3 className={styles.cardGroupTitle}>صاحب النشاط</h3>
          <div className={styles.contactRow}>
            <span className={styles.contactValue}>{biz.owner.display_name}</span>
            {biz.owner.phone && (
              <>
                <span className={styles.dot}>·</span>
                <span className={styles.contactValue}>{biz.owner.phone}</span>
              </>
            )}
          </div>
        </div>
      )}

      <div className={styles.cardGroup}>
        <h3 className={styles.cardGroupTitle}>جهات الاتصال ({biz.contacts.length})</h3>
        {biz.contacts.length === 0 ? (
          <p className={styles.muted}>لا يوجد — أضفها من تبويب التعديل</p>
        ) : (
          biz.contacts.map((c, i) => (
            <div key={`${c.method_type}-${i}`} className={styles.contactRow}>
              <span className={styles.contactType}>
                {CONTACT_LABEL[c.method_type] ?? c.method_type}
              </span>
              <span className={styles.contactValue}>{c.value}</span>
              {c.is_primary && <span className={styles.primaryChip}>أساسي</span>}
            </div>
          ))
        )}
      </div>

      <div className={styles.cardGroup}>
        <h3 className={styles.cardGroupTitle}>الفروع ({biz.branches.length})</h3>
        {biz.branches.length === 0 ? (
          <p className={styles.muted}>لا يوجد فروع</p>
        ) : (
          biz.branches.map((br) => (
            <div key={br.id} className={styles.contactRow}>
              <span className={styles.contactValue}>{br.name}</span>
              {br.area && (
                <>
                  <span className={styles.dot}>·</span>
                  <span className={styles.contactType}>{br.area}</span>
                </>
              )}
            </div>
          ))
        )}
      </div>

      <div className={styles.cardGroup}>
        <h3 className={styles.cardGroupTitle}>الصور ({biz.media.length})</h3>
        <p className={styles.muted}>
          {biz.media.length === 0 ? 'لا يوجد — أضف من تبويب التعديل' : 'محفوظة'}
        </p>
      </div>

      {biz.rejected_at && biz.rejection_reason && (
        <div className={`${styles.cardGroup} ${styles.rejectionGroup}`}>
          <h3 className={`${styles.cardGroupTitle} ${styles.rejectionTitle}`}>سبب الرفض</h3>
          <p className={styles.rejectionBody}>{biz.rejection_reason}</p>
        </div>
      )}
    </div>
  )
}
