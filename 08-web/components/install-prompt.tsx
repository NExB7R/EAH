'use client'

import { useEffect, useState } from 'react'

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }

export default function InstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setEvent(e as BeforeInstallPromptEvent)
      if (localStorage.getItem('eah_install_dismissed') !== '1') setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!visible || !event) return null

  async function install() {
    await event!.prompt()
    const choice = await event!.userChoice
    if (choice.outcome === 'dismissed') localStorage.setItem('eah_install_dismissed', '1')
    setVisible(false)
  }

  function dismiss() {
    localStorage.setItem('eah_install_dismissed', '1')
    setVisible(false)
  }

  return <div className="install-prompt" role="dialog" aria-label="تثبيت EAH">
    <div><strong>خلي EAH في إيدك</strong><span>ثبّته على الشاشة وارجع للعروض والمفضلة أسرع.</span></div>
    <div className="install-actions"><button className="primary" onClick={install}>ثبّت EAH</button><button className="ghost-btn" onClick={dismiss}>مش دلوقتي</button></div>
  </div>
}
