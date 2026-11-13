'use client'

import Avatar from '@/components/avatar'
import { CheckCircleIcon, CrownGoldIcon, ShieldCheckIcon } from '@/components/icons'
import type { PhoneSearchResult } from '@/lib/types/phone-search'
import styles from './phone-result-card.module.css'

type Props = { result: PhoneSearchResult }

export function PhoneResultCard({ result }: Props) {
  if (!result.ok) return null
  if (!result.found) {
    if (result.reason === 'privacy') {
      return (
        <div className={styles.card}>
          <p className={styles.hint}>هذا الرقم مسجل، لكن صاحبه اختار عدم الظهور</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className={styles.card} role="status" aria-live="polite">
      <div className={styles.header}>
        <Avatar
          displayName={result.display_name}
          avatarUrl={result.avatar_url}
          role="customer"
          size="sm"
        />
        <div className={styles.info}>
          <div className={styles.name}>
            <strong>{result.display_name}</strong>
            {result.is_verified && <CheckCircleIcon size={14} />}
            {result.is_premium && <CrownGoldIcon size={14} />}
          </div>
          {result.viewer === 'admin' && (
            <span className={styles.adminBadge}>
              <ShieldCheckIcon size={10} />
              عرض أدمن
            </span>
          )}
        </div>
      </div>
      <dl className={styles.stats}>
        <div>
          <dt>المصداقية</dt>
          <dd>{result.trust_score}/100</dd>
        </div>
        <div>
          <dt>المستوى</dt>
          <dd>{result.trust_tier}</dd>
        </div>
        <div>
          <dt>عضو منذ</dt>
          <dd>
            {new Date(result.member_since).toLocaleDateString('ar-EG', {
              year: 'numeric',
              month: 'long',
            })}
          </dd>
        </div>
      </dl>
      {result.viewer === 'admin' && result.phone && (
        <div className={styles.phoneRow}>
          <span>الهاتف:</span>
          <span dir="ltr">{result.phone}</span>
        </div>
      )}
    </div>
  )
}
