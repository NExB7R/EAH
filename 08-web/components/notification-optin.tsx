'use client'

import { useEffect, useState } from 'react'

export default function NotificationOptIn() {
  const [show, setShow] = useState(false)
  const [working, setWorking] = useState(false)

  useEffect(() => {
    if (!('Notification' in window)) return
    if (Notification.permission === 'default' && localStorage.getItem('eah_notification_prompted') !== '1') {
      setShow(true)
    }
  }, [])

  if (!show) return null

  async function enable() {
    setWorking(true)
    localStorage.setItem('eah_notification_prompted', '1')
    const permission = await Notification.requestPermission()
    setShow(false)
    setWorking(false)
    if (permission === 'granted') new Notification('EAH', { body: 'هتوصلك العروض المهمة من مفضلاتك.' })
  }

  return <div className="soft-banner">
    <div><strong>تحب نبلغك لما مفضلاتك تنزل عرض؟</strong><span>إشعارات اختيارية للعروض المهمة بس.</span></div>
    <div className="install-actions"><button className="primary" disabled={working} onClick={enable}>{working ? 'لحظة…' : 'فعّل الإشعارات'}</button><button className="ghost-btn" onClick={() => { localStorage.setItem('eah_notification_prompted', '1'); setShow(false) }}>مش دلوقتي</button></div>
  </div>
}
