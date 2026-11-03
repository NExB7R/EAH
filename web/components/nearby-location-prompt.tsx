'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { NavigationIcon, MapPinIcon, CheckCircleIcon } from './icons'
import { saveNearbyLocation } from '@/app/account/edit/actions'
import styles from './nearby-location-prompt.module.css'

type Props = {
  isLoggedIn: boolean
}

export default function NearbyLocationPrompt({ isLoggedIn }: Props) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const requestAndSave = () => {
    if (!isLoggedIn) return
    if (!navigator.geolocation) {
      setMessage('المتصفح لا يدعم تحديد الموقع. حدّث منطقتك من بيانات الحساب.')
      return
    }

    setPending(true)
    setMessage(null)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const formData = new FormData()
        formData.set('latitude', String(position.coords.latitude))
        formData.set('longitude', String(position.coords.longitude))
        const result = await saveNearbyLocation(formData)
        setPending(false)
        if (!result.ok) {
          setMessage(result.error)
          return
        }
        setMessage('اتحفظ موقعك — بنرتب الأقرب ليك دلوقتي')
        router.refresh()
      },
      () => {
        setPending(false)
        setMessage('مش قادرين نحدد موقعك. اسمح بإذن الموقع أو حدّث منطقتك من الحساب.')
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 15 * 60 * 1000 },
    )
  }

  return (
    <div className={styles.panel}>
      <span className={styles.icon} aria-hidden><NavigationIcon size={22} /></span>
      <div className={styles.copy}>
        <strong>{isLoggedIn ? 'خلينا نحدد مكانك بدقة' : 'سجّل عشان نكتشف الأماكن القريبة منك'}</strong>
        <p>
          {isLoggedIn
            ? 'موقعك بيتحفظ في حسابك بعد موافقتك، ونستخدمه لحساب المسافات وترتيب الأقرب.'
            : 'أنشئ حسابك وحدد منطقتك أو موقعك أثناء التسجيل، وبعدها هنعرضلك المسافة الحقيقية.'}
        </p>
        {message && <span className={styles.message} role="status">{message}</span>}
      </div>
      {isLoggedIn ? (
        <button type="button" className={styles.action} onClick={requestAndSave} disabled={pending}>
          <MapPinIcon size={15} />
          {pending ? 'بنحدد موقعك…' : 'حدد موقعي'}
        </button>
      ) : (
        <Link href="/auth?mode=signup" className={styles.action}>
          <CheckCircleIcon size={15} />
          سجّل الآن
        </Link>
      )}
    </div>
  )
}
