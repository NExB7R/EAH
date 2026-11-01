'use client'

import { useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import BusinessShareModal from './business-share-modal'
import { ShareIcon } from './icons'
import styles from './global-share-action.module.css'

const subscribeToMountState = () => () => {}
const getClientMountSnapshot = () => true
const getServerMountSnapshot = () => false

type Props = {
  label?: string
  className?: string
}

export default function GlobalShareAction({
  label = 'شارك المنصة ورمز الاستجابة السريعة',
  className = '',
}: Props) {
  const mounted = useSyncExternalStore(
    subscribeToMountState,
    getClientMountSnapshot,
    getServerMountSnapshot,
  )
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState<string | null>(null)

  const openShare = () => {
    setUrl(`${window.location.origin}/`)
    setOpen(true)
  }

  return (
    <>
      <button
        type="button"
        className={[styles.action, className].filter(Boolean).join(' ')}
        aria-label={label}
        aria-haspopup="dialog"
        onClick={openShare}
      >
        <span className={styles.iconWrap} aria-hidden="true">
          <ShareIcon size={18} />
        </span>
        <span>{label}</span>
      </button>
      {mounted && url && createPortal(
        <BusinessShareModal
          open={open}
          onClose={() => setOpen(false)}
          url={url}
          title="EAH — اللي نفسك فيه ؟"
        />,
        document.body,
      )}
    </>
  )
}
