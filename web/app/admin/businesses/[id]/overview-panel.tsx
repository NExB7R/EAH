import type { AdminBusiness } from '@/lib/data/admin-business'
import BusinessNotice from '@/components/business-notice'
import StatCard from '@/components/dashboard/stat-card'
import Panel from '@/components/dashboard/panel'
import { ShieldCheckIcon, StarIcon, CrownGoldIcon, FileTextIcon } from '@/components/icons'
import DeleteBusinessButton from './delete-button'
import styles from './detail-tabs.module.css'

const CONTACT_LABEL: Record<string, string> = {
  phone: 'هاتف',
  whatsapp: 'واتساب',
  complaints: 'شكاوى',
  facebook: 'فيسبوك',
  instagram: 'إنستجرام',
  website: 'موقع',
  manager: 'مسئول',
  shift_morning: 'شفت صباحي',
  shift_evening: 'شفت مسائي',
  additional: 'إضافي',
}

export default function OverviewPanel({ biz }: { biz: AdminBusiness }) {
  const notice = biz.important_notice
    ? {
        text: biz.important_notice,
        severity: biz.notice_severity,
        expiresAt: biz.notice_expires_at,
      }
    : null

  return (
    <div className={styles.overviewGrid}>
      {notice && (
        <div className={styles.overviewFull}>
          <BusinessNotice notice={notice} />
        </div>
      )}

      <section className={styles.overviewStats}>
        <StatCard icon={ShieldCheckIcon} label="المصداقية" value={biz.trust_score} tone="teal" />
        <StatCard
          icon={StarIcon}
          label="التقييم"
          value={biz.rating_avg.toFixed(1)}
          hint={biz.rating_count > 0 ? `${biz.rating_count} تقييم` : undefined}
          tone="gold"
        />
        <StatCard
          icon={CrownGoldIcon}
          label="الطلبات الناجحة"
          value={biz.successful_orders}
          tone="purple"
        />
        <StatCard
          icon={FileTextIcon}
          label="جهات الاتصال"
          value={biz.contacts.length}
          tone="orange"
        />
      </section>

      {biz.owner && (
        <Panel title="صاحب النشاط">
          <div className={styles.ownerRow}>
            <span className={styles.ownerName}>{biz.owner.display_name}</span>
            {biz.owner.phone && <span className={styles.ownerPhone}>{biz.owner.phone}</span>}
          </div>
        </Panel>
      )}

      <Panel title={`جهات الاتصال (${biz.contacts.length})`}>
        {biz.contacts.length === 0 ? (
          <p className={styles.muted}>لا يوجد — أضفها من تبويب التعديل</p>
        ) : (
          <ul className={styles.contactList}>
            {biz.contacts.map((c, i) => (
              <li key={`${c.method_type}-${i}`} className={styles.contactRow}>
                <span className={styles.contactType}>
                  {CONTACT_LABEL[c.method_type] ?? c.method_type}
                </span>
                <span className={styles.contactValue}>{c.value}</span>
                {c.is_primary && <span className={styles.primaryChip}>أساسي</span>}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title={`الفروع (${biz.branches.length})`}>
        {biz.branches.length === 0 ? (
          <p className={styles.muted}>لا يوجد فروع</p>
        ) : (
          <ul className={styles.contactList}>
            {biz.branches.map((br) => (
              <li key={br.id} className={styles.contactRow}>
                <span className={styles.contactValue}>{br.name}</span>
                {br.area && <span className={styles.contactType}>{br.area}</span>}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {biz.rejected_at && biz.rejection_reason && (
        <div className={styles.overviewFull}>
          <Panel title="سبب الرفض">
            <p className={styles.rejectionBody}>{biz.rejection_reason}</p>
          </Panel>
        </div>
      )}

      <div className={styles.overviewFull}>
        <div className={styles.dangerZone}>
          <div className={styles.dangerHead}>
            <h3 className={styles.dangerTitle}>منطقة الخطر</h3>
            <p className={styles.dangerText}>
              حذف النشاط نهائياً — لا يمكن التراجع. كل البيانات (تقييمات، طلبات، فروع) هتتمسح.
            </p>
          </div>
          <DeleteBusinessButton id={biz.id} name={biz.name} />
        </div>
      </div>
    </div>
  )
}
