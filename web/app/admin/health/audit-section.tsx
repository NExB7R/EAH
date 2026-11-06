import { FileTextIcon, ClockIcon, UserIcon, TrendingUpIcon, AlertIcon } from '@/components/icons'
import EmptyState from '@/components/empty-state'
import { getAuditLogs, getAuditStats } from '@/lib/data/admin'
import AuditFilters from '../audit/audit-filters'
import styles from '../audit/audit.module.css'

// ═══════════════════════════════════════════════════════════════════
// Audit section — extracted from /admin/audit for health merge (SPRAWL-01)
// ═══════════════════════════════════════════════════════════════════

const ACTION_LABEL: Record<string, { label: string; tone: string }> = {
  'featured.enable': { label: 'تفعيل التمييز', tone: 'gold' },
  'featured.disable': { label: 'إلغاء التمييز', tone: 'red' },
  'featured.pin': { label: 'تثبيت', tone: 'gold' },
  'featured.unpin': { label: 'إلغاء التثبيت', tone: 'purple' },
  'featured.reorder': { label: 'ترتيب', tone: 'purple' },
  'featured.extend': { label: 'تمديد', tone: 'teal' },
  'notifications.broadcast': { label: 'إشعار جماعي', tone: 'purple' },
  'review.moderate': { label: 'مراجعة تقييم', tone: 'teal' },
  'user.ban': { label: 'حظر مستخدم', tone: 'red' },
  'user.unban': { label: 'إلغاء حظر', tone: 'teal' },
  'business.approve': { label: 'موافقة نشاط', tone: 'teal' },
  'business.reject': { label: 'رفض نشاط', tone: 'red' },
  'business.archive': { label: 'إخفاء نشاط', tone: 'red' },
  'business.republish': { label: 'إعادة نشر', tone: 'teal' },
  'business.delete': { label: 'حذف نشاط', tone: 'red' },
  'subscription.approve': { label: 'موافقة اشتراك', tone: 'teal' },
  'subscription.reject': { label: 'رفض اشتراك', tone: 'red' },
  'subscription.extend': { label: 'تمديد اشتراك', tone: 'teal' },
  'subscription.cancel': { label: 'إلغاء اشتراك', tone: 'red' },
  'ad.approve': { label: 'موافقة إعلان', tone: 'teal' },
  'ad.reject': { label: 'رفض إعلان', tone: 'red' },
  'ad.pause': { label: 'إيقاف إعلان', tone: 'gold' },
  'ad.resume': { label: 'استئناف إعلان', tone: 'teal' },
  'ad.delete': { label: 'حذف إعلان', tone: 'red' },
  'features.update': { label: 'تحديث الميزات', tone: 'purple' },
  'texts.update': { label: 'تحديث النصوص', tone: 'purple' },
}

const METADATA_LABEL: Record<string, string> = {
  name: 'الاسم',
  title: 'العنوان',
  reason: 'السبب',
  admin_note: 'ملاحظة الأدمن',
  days: 'عدد الأيام',
  delta: 'التغيير في نقاط المشاركة',
  from: 'القيمة السابقة',
  to: 'القيمة الجديدة',
  target_role: 'الدور',
  count: 'العدد',
  inserted: 'عدد الإشعارات المضافة',
  pushed: 'عدد الإشعارات الفورية',
  total: 'عدد المستهدفين',
  notified: 'تم إرسال إشعار',
  ids: 'عدد الحسابات المحددة',
  owner_profile_id: 'حساب التاجر المرتبط',
  business_id: 'النشاط المرتبط',
  business_type_status: 'حالة تصنيف النشاط',
  offline_until: 'موعد انتهاء التوقف',
  minutes_added: 'الدقائق المضافة',
  enabled: 'التفعيل',
  source: 'مصدر العملية',
  theme: 'نمط العرض',
  audience: 'الفئة المستهدفة',
  status: 'الحالة',
  fields: 'البيانات التي تم تحديثها',
  keys: 'الإعدادات التي تم تحديثها',
  price: 'السعر',
  severity: 'درجة الأهمية',
  rating: 'التقييم',
  has_text: 'يوجد نص مرفق',
}

const METADATA_VALUE_LABEL: Record<string, string> = {
  super_admin: 'الأدمن',
  merchant: 'التاجر',
  customer: 'العميل',
  admin: 'غير محدد',
  pending: 'قيد المراجعة',
  approved: 'معتمد',
  rejected: 'مرفوض',
  active: 'نشط',
  inactive: 'غير نشط',
  cancelled: 'ملغي',
  expired: 'منتهي',
  paused: 'متوقف مؤقتًا',
  enabled: 'مفعل',
  disabled: 'معطل',
  true: 'نعم',
  false: 'لا',
  admin_self: 'من لوحة الأدمن',
  merchant_self: 'من حساب التاجر',
}

const FIELD_LABEL: Record<string, string> = {
  name: 'الاسم',
  business_type: 'نوع النشاط',
  location: 'الموقع',
  contacts: 'بيانات التواصل',
  is_open: 'حالة الفتح',
  site_name: 'اسم المنصة',
  support_email: 'بريد الدعم',
  support_whatsapp: 'رقم واتساب الدعم',
  support_facebook_url: 'صفحة فيسبوك',
  whatsapp_channel_url: 'قناة واتساب',
  public_contacts_enabled: 'إظهار وسائل التواصل',
}

function formatMetadata(metadata: Record<string, unknown>): string {
  const entries = Object.entries(metadata).flatMap(([key, value]) => {
    const label = METADATA_LABEL[key]
    if (!label || value === null || value === undefined) return []

    if (key === 'ids' && Array.isArray(value)) {
      return [`${label}: ${value.length.toLocaleString('ar-EG')}`]
    }

    if ((key === 'fields' || key === 'keys') && Array.isArray(value)) {
      const names = value
        .map((item) => (typeof item === 'string' ? FIELD_LABEL[item] : undefined))
        .filter((item): item is string => Boolean(item))
      return names.length ? [`${label}: ${names.join('، ')}`] : []
    }

    if (typeof value === 'boolean') {
      return [`${label}: ${value ? 'نعم' : 'لا'}`]
    }

    if (typeof value === 'number') {
      return [`${label}: ${value.toLocaleString('ar-EG')}`]
    }

    if (typeof value === 'string') {
      if (/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(value)) {
        return [`${label}: محفوظ`]
      }
      const translated = METADATA_VALUE_LABEL[value]
      if (translated) return [`${label}: ${translated}`]
      if (value.length > 0 && value.length <= 120) return [`${label}: ${value}`]
    }

    return []
  })

  return entries.length ? entries.join('\n') : 'تفاصيل العملية محفوظة في سجل التدقيق.'
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('ar-EG', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

type Props = {
  q?: string
  action?: string
  actor?: string
}

export default async function AuditSection({ q: qRaw, action, actor }: Props) {
  const q = (qRaw ?? '').trim().toLowerCase()
  const actionFilter = action ?? ''
  const actorFilter = actor ?? ''

  const [logs, stats] = await Promise.all([getAuditLogs(300), getAuditStats()])

  let filtered = logs
  if (actionFilter) filtered = filtered.filter((l) => l.action === actionFilter)
  if (actorFilter) filtered = filtered.filter((l) => l.actor_user_id === actorFilter)
  if (q) {
    filtered = filtered.filter(
      (l) =>
        l.action.toLowerCase().includes(q) ||
        (l.actor?.display_name ?? '').toLowerCase().includes(q) ||
        (l.entity_type ?? '').toLowerCase().includes(q),
    )
  }

  const uniqueActions = Array.from(new Set(logs.map((l) => l.action))).sort()
  const actorsMap = new Map<string, string>()
  for (const l of logs) {
    if (l.actor_user_id && l.actor?.display_name) {
      actorsMap.set(l.actor_user_id, l.actor.display_name)
    }
  }
  const uniqueActors = Array.from(actorsMap.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ar'))

  return (
    <>
      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>
            <FileTextIcon size={20} />
          </span>
          <div>
            <span className={styles.statValue}>{stats.total.toLocaleString('ar-EG')}</span>
            <span className={styles.statLabel}>إجمالي</span>
          </div>
        </div>
        <div className={`${styles.statCard} ${stats.today > 0 ? styles.statWarn : ''}`}>
          <span className={`${styles.statIcon} ${styles.iconWarn}`}>
            <ClockIcon size={20} />
          </span>
          <div>
            <span className={styles.statValue}>{stats.today}</span>
            <span className={styles.statLabel}>اليوم</span>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.statOk}`}>
          <span className={`${styles.statIcon} ${styles.iconOk}`}>
            <TrendingUpIcon size={20} />
          </span>
          <div>
            <span className={styles.statValue}>{stats.thisWeek}</span>
            <span className={styles.statLabel}>آخر 7 أيام</span>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.statGold}`}>
          <span className={`${styles.statIcon} ${styles.iconGold}`}>
            <UserIcon size={20} />
          </span>
          <div>
            <span className={styles.statValue}>{stats.uniqueActors}</span>
            <span className={styles.statLabel}>أدمن نشط</span>
          </div>
        </div>
      </section>

      <AuditFilters actions={uniqueActions} actors={uniqueActors} />

      {filtered.length === 0 ? (
        <EmptyState
          Icon={q || actionFilter || actorFilter ? AlertIcon : FileTextIcon}
          title={logs.length === 0 ? 'مفيش عمليات لسه' : 'مفيش نتائج للفلتر'}
          description={
            logs.length === 0
              ? 'أي عملية إدارية هتتسجل هنا تلقائياً'
              : 'جرّب فلتر تاني أو امسح البحث'
          }
        />
      ) : (
        <div className={styles.list}>
          {filtered.map((log) => {
            const meta = ACTION_LABEL[log.action] ?? {
              label: 'إجراء إداري',
              tone: 'neutral',
            }
            return (
              <article key={log.id} className={styles.row}>
                <div className={styles.rowHead}>
                  <span className={`${styles.badge} ${styles[meta.tone]}`}>{meta.label}</span>
                  <time className={styles.date}>
                    <ClockIcon size={11} />
                    {fmtDate(log.created_at)}
                  </time>
                </div>

                <div className={styles.rowBody}>
                  <div className={styles.actor}>
                    <span className={styles.actorLabel}>بواسطة:</span>
                    <strong className={styles.actorName}>
                      {log.actor?.display_name ?? 'نظام'}
                    </strong>
                  </div>

                  {log.entity_type && (
                    <div className={styles.entity}>
                      <span className={styles.entityLabel}>{log.entity_type === 'business' ? 'نشاط' : log.entity_type === 'profile' ? 'حساب' : log.entity_type === 'advertisement' ? 'إعلان' : log.entity_type === 'business_insight' ? 'تقرير' : 'سجل إداري'}</span>
                      {log.entity_id && (
                        <code className={styles.entityId}>{log.entity_id.slice(0, 8)}</code>
                      )}
                    </div>
                  )}
                </div>

                {Object.keys(log.metadata).length > 0 && (
                  <details className={styles.meta}>
                    <summary>التفاصيل</summary>
                    <pre className={styles.metaPre}>{formatMetadata(log.metadata)}</pre>
                  </details>
                )}
              </article>
            )
          })}
        </div>
      )}
    </>
  )
}
