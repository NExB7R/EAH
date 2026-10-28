import EmptyState from '@/components/empty-state'
import { ShieldCheckIcon, AlertIcon, UserIcon, CrownGoldIcon } from '@/components/icons'
import {
  getFraudStats,
  getFlaggedReviews,
  getRecentTrustEvents,
  getFlaggedUsers,
  getMultiAccountIps,
} from '@/lib/data/fraud'
import Link from 'next/link'
import styles from './fraud.module.css'

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'دلوقتي'
  if (m < 60) return `من ${m} دقيقة`
  const h = Math.floor(m / 60)
  if (h < 24) return `من ${h} ساعة`
  return `من ${Math.floor(h / 24)} يوم`
}

const EVENT_LABEL: Record<string, string> = {
  review_created: 'تقييم جديد',
  review_approved: 'تقييم مقبول',
  review_rejected: 'تقييم مرفوض',
  order_completed: 'طلب مكتمل',
  order_cancelled: 'طلب ملغي',
  report_filed: 'بلاغ',
  report_resolved: 'بلاغ اتحل',
  decay: 'تراجع نقاط المشاركة',
  badge_awarded: 'شارة جديدة',
}

export default async function FraudView() {
  const [stats, flaggedReviews, events, flaggedUsers, multiIps] = await Promise.all([
    getFraudStats(),
    getFlaggedReviews(),
    getRecentTrustEvents(30),
    getFlaggedUsers(20),
    getMultiAccountIps(30),
  ])

  return (
    <div>
      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>تقييمات معلّقة</div>
          <div className={styles.cardValue}>{stats.flagged}</div>
        </div>
        <div className={`${styles.card} ${stats.wanted > 0 ? styles.cardWarn : ''}`}>
          <div className={styles.cardLabel}>إشارات مخاطر داخلية</div>
          <div className={styles.cardValue}>{stats.wanted}</div>
        </div>
        <div className={`${styles.card} ${stats.banned > 0 ? styles.cardDanger : ''}`}>
          <div className={styles.cardLabel}>محظورون حالياً</div>
          <div className={styles.cardValue}>{stats.banned}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>أحداث trust (24س)</div>
          <div className={styles.cardValue}>{stats.trustEvents24h}</div>
        </div>
      </div>

      {/* التقييمات المُعلّمة */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>تقييمات مُعلّمة (Velocity / Auto-flag)</h2>
        {flaggedReviews.length === 0 ? (
          <EmptyState
            Icon={ShieldCheckIcon}
            title="مفيش تقييمات مُعلّمة"
            description="النظام بيمسك المحاولات المريبة تلقائياً."
          />
        ) : (
          <ul className={styles.list}>
            {flaggedReviews.map((r) => (
              <li key={r.id} className={styles.item}>
                <div className={styles.itemHead}>
                  <span className={styles.badge}>
                    <AlertIcon size={12} />
                    {r.flagged_reason ?? 'مُعلّم'}
                  </span>
                  <span className={styles.time}>{timeAgo(r.created_at)}</span>
                </div>
                <div className={styles.itemBody}>
                  {r.comment && <p className={styles.comment}>{r.comment}</p>}
                  <Link href={`/businesses/${r.business_slug}`} className={styles.bizLink}>
                    {r.business_name}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Wanted Users */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>إشارات مخاطر داخلية</h2>
        {flaggedUsers.length === 0 ? (
          <EmptyState
            Icon={UserIcon}
            title="مفيش إشارات مخاطر داخلية"
            description="مفيش إشارة داخلية مسجلة حاليًا. البلاغات غير المحققة لا تُحتسب."
          />
        ) : (
          <ul className={styles.list}>
            {flaggedUsers.map((u) => {
              const isBanned = !!u.banned_until && new Date(u.banned_until) > new Date()
              return (
                <li key={u.id} className={styles.item}>
                  <div className={styles.itemHead}>
                    <span className={styles.flaggedStars}>
                      {'⭐'.repeat(Math.min(u.wanted_level, 5))}
                      {u.wanted_level >= 5 && '💀'}
                    </span>
                    {isBanned && <span className={styles.bannedTag}>محظور</span>}
                  </div>
                  <div className={styles.itemBody}>
                    <div className={styles.userRow}>
                      <span className={styles.userName}>{u.display_name}</span>
                      <span className={styles.userMeta}>نقاط المشاركة: {u.trust_score}</span>
                      <span className={styles.userMeta}>بلاغات مثبتة: {u.report_wanted_level}</span>
                      <span className={styles.userMeta}>إشارة حسابات متعددة: {u.multi_account_level}</span>
                      {u.phone && <span className={styles.userMeta}>· {u.phone}</span>}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Multi-Account IPs */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>عناوين IP فيها 3+ حسابات (30 يوم)</h2>
        {multiIps.length === 0 ? (
          <EmptyState
            Icon={ShieldCheckIcon}
            title="مفيش عناوين مريبة"
            description="مفيش عناوين IP فيها حسابات متعددة."
          />
        ) : (
          <ul className={styles.list}>
            {multiIps.map((m) => (
              <li key={m.ip_hash_prefix} className={styles.item}>
                <div className={styles.itemHead}>
                  <code className={styles.ipHash}>{m.ip_hash_prefix}…</code>
                  <span className={styles.countTag}>{m.accounts_count} حساب</span>
                  <span className={styles.time}>{timeAgo(m.latest_signup)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Trust Events */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>آخر أحداث Trust</h2>
        {events.length === 0 ? (
          <EmptyState Icon={CrownGoldIcon} title="مفيش أحداث" description="مفيش حركة trust لسه." />
        ) : (
          <ul className={styles.eventList}>
            {events.map((e) => {
              const positive = e.delta > 0
              return (
                <li key={e.id} className={styles.eventItem}>
                  <span
                    className={`${styles.delta} ${positive ? styles.deltaPlus : styles.deltaMinus}`}
                  >
                    {positive ? '+' : ''}
                    {e.delta}
                  </span>
                  <div className={styles.eventBody}>
                    <span className={styles.eventLabel}>
                      {EVENT_LABEL[e.event_type] ?? e.event_type}
                    </span>
                    <span className={styles.eventMeta}>
                      {e.score_before} → {e.score_after}
                    </span>
                  </div>
                  <span className={styles.time}>{timeAgo(e.created_at)}</span>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
