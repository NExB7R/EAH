'use client'

import Link from 'next/link'
import Avatar from '@/components/avatar'
import {
  CheckCircleIcon,
  CrownGoldIcon,
  ShieldCheckIcon,
  LockIcon,
  StoreIcon,
} from '@/components/icons'
import type { PhoneSearchResult, LinkedBusiness } from '@/lib/types/phone-search'
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

  const isAnon = result.privacy_mode === 'anonymous'

  return (
    <div className={styles.card} role="status" aria-live="polite">
      <Header result={result} isAnon={isAnon} />
      <TrustRow result={result} />
      {result.business && <BusinessSection business={result.business} />}
      {result.viewer === 'admin' && result.phone && (
        <div className={styles.phoneRow}>
          <span>الهاتف:</span>
          <span dir="ltr">{result.phone}</span>
        </div>
      )}
    </div>
  )
}

function Header({ result, isAnon }: { result: PhoneSearchResult; isAnon: boolean }) {
  if (!result.ok || !result.found) return null

  if (isAnon) {
    return (
      <div className={styles.header}>
        <div className={styles.anonIcon}>
          <LockIcon size={20} />
        </div>
        <div className={styles.info}>
          <div className={styles.name}>
            <strong>حساب مخفي</strong>
            {result.is_verified && <CheckCircleIcon size={14} />}
            {result.is_premium && <CrownGoldIcon size={14} />}
          </div>
          <span className={styles.anonHint}>صاحب الرقم اختار إخفاء هويته — لكن حسابه موثّق</span>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.header}>
      {result.display_name && (
        <Avatar
          displayName={result.display_name}
          avatarUrl={result.avatar_url ?? null}
          role="customer"
          size="sm"
        />
      )}
      <div className={styles.info}>
        <div className={styles.name}>
          <strong>{result.display_name ?? 'مستخدم EAH'}</strong>
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
  )
}

function TrustRow({ result }: { result: PhoneSearchResult }) {
  if (!result.ok || !result.found) return null

  return (
    <dl className={styles.stats}>
      <div>
        <dt>المصداقية</dt>
        <dd>{result.trust_score}/100</dd>
      </div>
      <div>
        <dt>المستوى</dt>
        <dd>{result.trust_tier}</dd>
      </div>
      {result.member_since && (
        <div>
          <dt>عضو منذ</dt>
          <dd>
            {new Date(result.member_since).toLocaleDateString('ar-EG', {
              year: 'numeric',
              month: 'long',
            })}
          </dd>
        </div>
      )}
    </dl>
  )
}

function BusinessSection({ business }: { business: LinkedBusiness }) {
  return (
    <Link href={`/business/${business.slug}`} className={styles.businessCard}>
      <div className={styles.businessHeader}>
        <StoreIcon size={16} />
        <strong>{business.name}</strong>
        {business.is_verified && <CheckCircleIcon size={12} />}
      </div>
      <div className={styles.businessMeta}>
        <span>{business.type}</span>
        {business.rating_count > 0 && (
          <span>
            ⭐ {business.rating_avg.toFixed(1)} ({business.rating_count})
          </span>
        )}
        <span className={business.is_open ? styles.openNow : styles.closed}>
          {business.is_open ? 'مفتوح الآن' : 'مغلق'}
        </span>
        {business.area && <span>{business.area}</span>}
      </div>
    </Link>
  )
}
