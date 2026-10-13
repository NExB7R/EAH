import { SparklesIcon, GlobeIcon, ClockIcon, ShieldCheckIcon } from '@/components/icons'
import styles from './settings.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Settings System Info (read-only card)
// ═══════════════════════════════════════════════════════════

type Props = {
  version: string
  environment: string
  lastUpdated: string | null
  siteUrl: string
}

function fmt(iso: string | null): string {
  if (!iso) return 'لسه مااتحفظش'
  try {
    return new Date(iso).toLocaleString('ar-EG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

export default function SettingsSystemInfo({ version, environment, lastUpdated, siteUrl }: Props) {
  return (
    <section className={styles.systemInfo}>
      <header className={styles.systemInfoHead}>
        <span className={styles.systemInfoIcon}>
          <SparklesIcon size={18} />
        </span>
        <h2 className={styles.systemInfoTitle}>معلومات النظام</h2>
        <span className={styles.systemInfoBadge}>للقراءة فقط</span>
      </header>

      <div className={styles.systemInfoGrid}>
        <div className={styles.infoItem}>
          <span className={styles.infoIcon}>
            <ShieldCheckIcon size={16} />
          </span>
          <div>
            <span className={styles.infoLabel}>الإصدار</span>
            <span className={styles.infoValue}>{version}</span>
          </div>
        </div>

        <div className={styles.infoItem}>
          <span className={styles.infoIcon}>
            <GlobeIcon size={16} />
          </span>
          <div>
            <span className={styles.infoLabel}>البيئة</span>
            <span className={styles.infoValue}>{environment}</span>
          </div>
        </div>

        <div className={styles.infoItem}>
          <span className={styles.infoIcon}>
            <ClockIcon size={16} />
          </span>
          <div>
            <span className={styles.infoLabel}>آخر حفظ للإعدادات</span>
            <span className={styles.infoValue}>{fmt(lastUpdated)}</span>
          </div>
        </div>

        <div className={styles.infoItem}>
          <span className={styles.infoIcon}>
            <GlobeIcon size={16} />
          </span>
          <div>
            <span className={styles.infoLabel}>الرابط</span>
            <span className={styles.infoValue} dir="ltr">
              {siteUrl}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
