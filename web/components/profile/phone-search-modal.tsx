'use client'

import { useState } from 'react'
import {
  SearchIcon,
  CloseIcon,
  ShieldCheckIcon,
  CrownGoldIcon,
  CheckCircleIcon,
} from '@/components/icons'
import type { PhoneSearchResult } from '@/lib/data/phone-search'
import { searchCustomerByPhone } from '@/lib/data/phone-search'
import styles from './phone-search-modal.module.css'
import Avatar from '@/components/avatar'

type Props = { onClose: () => void }

export function PhoneSearchModal({ onClose }: Props) {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PhoneSearchResult | null>(null)

  const handleSearch = async () => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10) {
      setResult({ ok: false, error: 'رقم غير صالح (10 أرقام على الأقل)' })
      return
    }
    setLoading(true)
    setResult(null)
    const res = await searchCustomerByPhone(phone)
    setResult(res)
    setLoading(false)
  }

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2 className={styles.title}>بحث برقم كامل</h2>
          <button type="button" onClick={onClose} className={styles.closeBtn} aria-label="إغلاق">
            <CloseIcon size={18} />
          </button>
        </header>
        <div className={styles.body}>
          <label className={styles.label} htmlFor="phone-input">
            رقم الموبايل (11 رقم)
          </label>
          <input
            id="phone-input"
            type="tel"
            inputMode="numeric"
            dir="ltr"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 13))}
            placeholder="01xxxxxxxxx"
            className={styles.input}
            maxLength={13}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            type="button"
            className={styles.searchBtn}
            onClick={handleSearch}
            disabled={loading}
          >
            <SearchIcon size={16} />
            {loading ? 'جاري البحث…' : 'بحث'}
          </button>
          <ResultView result={result} />
        </div>
      </div>
    </div>
  )
}

function ResultView({ result }: { result: PhoneSearchResult | null }) {
  if (!result) return null
  if (!result.ok) {
    const msg =
      result.error === 'rate_limit_hour'
        ? 'تجاوزت 10 عمليات بحث في الساعة — انتظر قليلًا'
        : result.error === 'rate_limit_day'
          ? 'تجاوزت 30 عملية بحث في اليوم — حاول غدًا'
          : result.error
    return <p className={styles.error}>{msg}</p>
  }
  if (!result.found) {
    return (
      <p className={styles.notFound}>
        {result.reason === 'privacy'
          ? 'هذا العميل لا يسمح بالظهور للطيارين'
          : 'لا يوجد حساب بهذا الرقم'}
      </p>
    )
  }
  return (
    <div className={styles.resultCard}>
      <div className={styles.resultHeader}>
        <Avatar
          displayName={result.display_name}
          avatarUrl={result.avatar_url}
          role="customer"
          size="sm"
        />
        <div className={styles.resultName}>
          <strong>{result.display_name}</strong>
          {result.is_verified && <CheckCircleIcon size={14} />}
          {result.is_premium && <CrownGoldIcon size={14} />}
        </div>
      </div>
      <dl className={styles.resultStats}>
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
        {result.phone && (
          <div>
            <dt>الهاتف</dt>
            <dd dir="ltr">{result.phone}</dd>
          </div>
        )}
      </dl>
      <div className={styles.watermark}>
        <ShieldCheckIcon size={12} />
        <span>نتيجة سرية — {result.viewer === 'admin' ? 'سوبر أدمن' : 'طيار'}</span>
      </div>
    </div>
  )
}
