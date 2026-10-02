'use client'

import { useEffect, useState, useTransition } from 'react'
import { BellIcon, CheckCircleIcon, AlertIcon } from './icons'
import {
  getPushStatus,
  subscribeToPush,
  unsubscribeFromPush,
  type PushStatus,
} from '@/lib/push/client'
import styles from './push-toggle.module.css'

export default function PushToggle() {
  const [status, setStatus] = useState<PushStatus>('default')
  const [msg, setMsg] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    getPushStatus().then(setStatus)
  }, [])

  const handleEnable = () => {
    startTransition(async () => {
      const res = await subscribeToPush()
      if (res.ok) {
        setStatus('granted')
        setMsg('تم تفعيل الإشعارات')
      } else {
        setMsg(res.error)
      }
    })
  }

  const handleDisable = () => {
    startTransition(async () => {
      const res = await unsubscribeFromPush()
      if (res.ok) {
        setStatus('default')
        setMsg('تم إيقاف الإشعارات')
      } else {
        setMsg(res.error)
      }
    })
  }

  if (status === 'unsupported') {
    return (
      <div className={styles.card}>
        <span className={styles.icon}>
          <AlertIcon size={20} />
        </span>
        <div className={styles.body}>
          <h4 className={styles.title}>الإشعارات الفورية</h4>
          <p className={styles.desc}>متصفحك مش بيدعم الإشعارات</p>
        </div>
      </div>
    )
  }

  if (status === 'denied') {
    return (
      <div className={styles.card}>
        <span className={styles.iconDanger}>
          <AlertIcon size={20} />
        </span>
        <div className={styles.body}>
          <h4 className={styles.title}>الإشعارات مقفولة</h4>
          <p className={styles.desc}>فعّلها من إعدادات المتصفح عشان توصلك العروض</p>
        </div>
      </div>
    )
  }

  const isOn = status === 'granted'

  return (
    <div className={`${styles.card} ${isOn ? styles.cardOn : ''}`}>
      <span className={styles.icon}>
        {isOn ? <CheckCircleIcon size={20} /> : <BellIcon size={20} />}
      </span>
      <div className={styles.body}>
        <h4 className={styles.title}>الإشعارات الفورية</h4>
        <p className={styles.desc}>
          {isOn
            ? 'هتوصلك إشعارات العروض والطلبات والتقييمات'
            : 'فعّلها عشان توصلك العروض الجديدة فوراً'}
        </p>
        {msg && <p className={styles.msg}>{msg}</p>}
      </div>
      <button
        type="button"
        onClick={isOn ? handleDisable : handleEnable}
        disabled={pending}
        className={`${styles.btn} ${isOn ? styles.btnOff : ''}`}
      >
        {pending ? '…' : isOn ? 'إيقاف' : 'تفعيل'}
      </button>
    </div>
  )
}
