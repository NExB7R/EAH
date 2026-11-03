'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AreaDropdown from './area-dropdown'
import { NavigationIcon, MapPinIcon, CheckCircleIcon } from './icons'
import { saveNearbyArea, saveNearbyLocation } from '@/app/account/edit/actions'
import styles from './nearby-location-prompt.module.css'

type Props = {
  isLoggedIn: boolean
  currentArea?: string | null
}

export default function NearbyLocationPrompt({ isLoggedIn, currentArea = '' }: Props) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [showAreaPicker, setShowAreaPicker] = useState(false)
  const [area, setArea] = useState(currentArea ?? '')

  const requestAndSave = () => {
    if (!isLoggedIn || pending) return
    if (!navigator.geolocation) {
      setMessage('المتصفح لا يدعم تحديد الموقع. اختار منطقتك يدويًا.')
      return
    }

    setPending(true)
    setMessage(null)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const formData = new FormData()
        formData.set('latitude', String(position.coords.latitude))
        formData.set('longitude', String(position.coords.longitude))
        try {
          const result = await saveNearbyLocation(formData)
          if (!result.ok) {
            setMessage(result.error)
            return
          }
          setMessage('اتحفظ موقعك — بنرتب الأقرب ليك دلوقتي')
          router.refresh()
        } catch {
          setMessage('حصلت مشكلة في حفظ الموقع. حاول مرة تانية.')
        } finally {
          setPending(false)
        }
      },
      () => {
        setPending(false)
        setMessage('مش قادرين نحدد موقعك. اسمح بإذن الموقع أو اختار منطقتك يدويًا.')
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 15 * 60 * 1000 },
    )
  }

  const saveArea = async () => {
    if (!isLoggedIn || pending) return
    if (!area) {
      setMessage('اختار منطقتك الأول.')
      return
    }

    setPending(true)
    setMessage(null)
    const formData = new FormData()
    formData.set('area', area)

    try {
      const result = await saveNearbyArea(formData)
      if (!result.ok) {
        setMessage(result.error)
        return
      }
      setShowAreaPicker(false)
      setMessage(`اتحفظت منطقتك: ${area}. هنعرض الأنشطة حسب المنطقة من غير ما نخمن المسافة.`)
      router.refresh()
    } catch {
      setMessage('حصلت مشكلة في حفظ المنطقة. حاول مرة تانية.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className={styles.panel}>
      <span className={styles.icon} aria-hidden><NavigationIcon size={22} /></span>
      <div className={styles.copy}>
        <strong>{isLoggedIn ? 'خلينا نعرف مكانك' : 'سجّل عشان نكتشف الأماكن القريبة منك'}</strong>
        <p>
          {isLoggedIn
            ? 'استخدم GPS للمسافة الفعلية، أو اختار منطقتك لعرض الأنشطة الموجودة فيها.'
            : 'أنشئ حسابك وحدد منطقتك أو موقعك أثناء التسجيل، وبعدها هنقدر نرتب الأقرب ليك.'}
        </p>
        {message && <span className={styles.message} role="status">{message}</span>}
      </div>

      {isLoggedIn ? (
        <div className={styles.actions}>
          <button type="button" className={styles.action} onClick={requestAndSave} disabled={pending}>
            <MapPinIcon size={15} />
            {pending ? 'بنحدد موقعك…' : 'حدد موقعي'}
          </button>
          <button
            type="button"
            className={styles.manualLink}
            onClick={() => setShowAreaPicker((open) => !open)}
            aria-expanded={showAreaPicker}
            disabled={pending}
          >
            {showAreaPicker ? 'إلغاء اختيار المنطقة' : 'اختار منطقتك يدويًا'}
          </button>
          {showAreaPicker && (
            <div className={styles.areaPicker}>
              <AreaDropdown value={area} onChange={setArea} disabled={pending} />
              <button type="button" className={styles.saveArea} onClick={saveArea} disabled={pending || !area}>
                {pending ? 'بيحفظ…' : 'حفظ المنطقة'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link href="/auth?mode=signup" className={styles.action}>
          <CheckCircleIcon size={15} />
          سجّل الآن
        </Link>
      )}
    </div>
  )
}
