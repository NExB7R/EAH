import Link from 'next/link'
import { notFound } from 'next/navigation'
import AccountPageHeader from '@/components/account-page-header'
import Avatar from '@/components/avatar'
import {
  ArrowLeftIcon,
  CloseIcon,
  CheckCircleIcon,
  ClockIcon,
  CrownGoldIcon,
  StarIcon,
  StoreIcon,
} from '@/components/icons'
import { getAdminUserDetail } from '@/lib/data/admin-user-detail'
import { getTrustTierMeta } from '@/lib/trust'
import UserDetailActions from './user-detail-actions'
import styles from './user-detail.module.css'

export const dynamic = 'force-dynamic'

const ROLE_LABEL: Record<string, string> = {
  customer: 'العميل',
  merchant: 'التاجر',
  admin: 'العميل',
  super_admin: 'الأدمن',
}

const REVIEW_STATUS_LABEL: Record<string, string> = {
  pending: 'قيد المراجعة',
  approved: 'معتمد',
  rejected: 'مرفوض',
  hidden: 'مخفي',
}

const AUDIT_ACTION_LABEL: Record<string, string> = {
  'user.ban': 'حظر الحساب',
  'user.unban': 'إلغاء حظر الحساب',
  'user.role.change': 'تغيير الدور',
  'user.premium.toggle': 'تغيير حالة التميز',
  'business.approve': 'اعتماد نشاط',
  'business.reject': 'رفض نشاط',
  'business.create': 'إنشاء نشاط',
  'business.update': 'تعديل نشاط',
  'business.archive': 'أرشفة نشاط',
  'business.owner.assign': 'ربط التاجر بالنشاط',
  'business.owner.remove': 'فك ربط التاجر بالنشاط',
}

function getReviewStatusLabel(status: string): string {
  return REVIEW_STATUS_LABEL[status] ?? 'حالة غير محددة'
}

function getAuditActionLabel(action: string): string {
  const normalized = action.toLowerCase()
  if (AUDIT_ACTION_LABEL[normalized]) return AUDIT_ACTION_LABEL[normalized]
  if (normalized.startsWith('business.')) return 'إجراء على نشاط'
  if (normalized.startsWith('user.')) return 'إجراء على حساب'
  return 'إجراء إداري'
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'دلوقتي'
  if (m < 60) return `من ${m} د`
  const h = Math.floor(m / 60)
  if (h < 24) return `من ${h} س`
  return `من ${Math.floor(h / 24)} ي`
}

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const detail = await getAdminUserDetail(id)

  if (!detail) notFound()

  const u = detail.profile
  const isBanned = !!u.banned_until && new Date(u.banned_until) > new Date()
  const joined = new Date(u.created_at).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className={styles.wrap}>
      <Link href="/admin/users" className={styles.backLink}>
        <ArrowLeftIcon size={14} />
        <span>رجوع للمستخدمين</span>
      </Link>

      <AccountPageHeader title={u.display_name} description={`عضو من ${joined}`} />

      {/* ─── Header Card ─── */}
      <section className={styles.headerCard}>
        <div className={styles.headerMain}>
          <Avatar
            displayName={u.display_name}
            avatarUrl={u.avatar_url}
            role={(detail.role as never) ?? 'customer'}
            isVerified={!!u.verified_at}
            isPaidMember={u.is_paid_member}
            size="md"
          />
          <div className={styles.headerInfo}>
            <h2 className={styles.name}>{u.display_name}</h2>
            <div className={styles.badges}>
              <span className={styles.badge}>{ROLE_LABEL[detail.role] ?? 'غير محدد'}</span>
              {u.is_premium &&
                (!u.premium_until || new Date(u.premium_until).getTime() > Date.now()) && (
                <span className={`${styles.badge} ${styles.badgeGold}`}>
                  <CrownGoldIcon size={11} /> مميز
                </span>
              )}
              {u.verified_at && (
                <span className={`${styles.badge} ${styles.badgeTeal}`}>
                  <CheckCircleIcon size={11} /> موثّق
                </span>
              )}
              {isBanned && (
                <span className={`${styles.badge} ${styles.badgeDanger}`}>
                  <CloseIcon size={11} /> محظور
                </span>
              )}
              {u.trust_tier && (
                <span className={styles.badge}>نقاط المشاركة: {getTrustTierMeta(u.trust_score).label}</span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.metaGrid}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>الهاتف</span>
            <span className={styles.metaValue} dir="ltr">
              {u.phone ?? '—'}
            </span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>نقاط المشاركة</span>
            <span className={styles.metaValue}>{u.trust_score}/100</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>مسجّل من</span>
            <span className={styles.metaValue}>{joined}</span>
          </div>
          {u.premium_until && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>مميز حتى</span>
              <span className={styles.metaValue}>
                {new Date(u.premium_until).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}
          {isBanned && u.banned_until && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>محظور حتى</span>
              <span className={styles.metaValue}>
                {new Date(u.banned_until).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}
        </div>

        {u.bio && <p className={styles.bio}>{u.bio}</p>}

        <UserDetailActions
          userId={u.id}
          isBanned={isBanned}
          isPremium={u.is_premium}
          currentRole={detail.role}
          trustScore={u.trust_score}
        />
      </section>

      {/* ─── Businesses (if any) ─── */}
      {detail.businesses.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <StoreIcon size={16} /> الأنشطة ({detail.businesses.length})
          </h2>
          <ul className={styles.list}>
            {detail.businesses.map((b) => (
              <li key={b.id} className={styles.listItem}>
                <Link href={`/admin/businesses/${b.id}`} className={styles.listLink}>
                  <span className={styles.listTitle}>{b.name}</span>
                  <span className={b.is_published ? styles.listOk : styles.listPending}>
                    {b.is_published ? 'منشور' : 'معلق'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ─── Reviews ─── */}
      {detail.reviews.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <StarIcon size={16} /> التقييمات ({detail.reviews.length})
          </h2>
          <ul className={styles.list}>
            {detail.reviews.map((r) => (
              <li key={r.id} className={styles.listItem}>
                <div className={styles.reviewHead}>
                  <span className={styles.reviewStars}>
                    {'★'.repeat(r.rating)}
                    {'☆'.repeat(5 - r.rating)}
                  </span>
                  <span className={styles.reviewStatus}>{getReviewStatusLabel(r.status)}</span>
                  <span className={styles.reviewTime}>{timeAgo(r.created_at)}</span>
                </div>
                {r.comment && <p className={styles.reviewComment}>{r.comment}</p>}
                {r.business_name && (
                  <span className={styles.reviewBiz}>على: {r.business_name}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ─── Audit Logs ─── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <ClockIcon size={16} /> آخر نشاط ({detail.auditLogs.length})
        </h2>
        {detail.auditLogs.length === 0 ? (
          <p className={styles.empty}>مفيش نشاط مسجّل</p>
        ) : (
          <ul className={styles.list}>
            {detail.auditLogs.map((l) => (
              <li key={l.id} className={styles.listItem}>
                <div className={styles.auditRow}>
                  <code className={styles.auditAction}>{getAuditActionLabel(l.action)}</code>
                  <span className={styles.auditTime}>{timeAgo(l.created_at)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
