'use client'

import { WhatsAppIcon, PhoneIcon, LockIcon } from './icons'
import SmartLockModal, { useSmartLock } from './smart-lock-modal'
import styles from './fixed-cta.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Fixed CTA (Mobile only)
// بيتغير حسب المتاح: واتساب → اتصال → مفيش
// ═══════════════════════════════════════════════════════════

type Props = {
  businessName: string
  whatsapp: string | null
  phone: string | null
  isLoggedIn: boolean
  isOpen: boolean
}

export default function FixedCta({
  businessName,
  whatsapp,
  phone,
  isLoggedIn,
  isOpen,
}: Props) {
  const lock = useSmartLock()

  // مفيش أي وسيلة تواصل
  if (!whatsapp && !phone) return null

  const handleClick = () => {
    if (!isLoggedIn) {
      lock.trigger('تتواصل مع ' + businessName, 'سجّل بسرعة وهيوصلك كل جديد')
      return
    }

    if (whatsapp) {
      const url = `https://wa.me/2${whatsapp.replace(/^0/, '').replace(/^20/, '')}?text=${encodeURIComponent(`السلام عليكم، شفت ${businessName} على EAH وعايز أطلب`)}`
      window.open(url, '_blank')
    } else if (phone) {
      window.location.href = `tel:${phone}`
    }
  }

  const label = whatsapp
    ? isOpen
      ? 'اطلب على واتساب'
      : 'واتساب — مغلق حالياً'
    : 'اتصل بالنشاط'

  return (
    <>
      <div className={styles.bar}>
        <button
          type="button"
          onClick={handleClick}
          className={`${styles.btn} ${whatsapp ? styles.whatsapp : styles.phone}`}
        >
          {isLoggedIn ? (
            whatsapp ? <WhatsAppIcon size={20} /> : <PhoneIcon size={20} />
          ) : (
            <LockIcon size={18} />
          )}
          <span>{label}</span>
        </button>
      </div>

      <SmartLockModal
        open={lock.open}
        onClose={lock.close}
        action={lock.action}
        hint={lock.hint}
      />
    </>
  )
}
