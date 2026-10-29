'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import BusinessShareModal from './business-share-modal'
import { ShareIcon } from './icons'
import styles from './global-share-action.module.css'

type Props = {
  label?: string
  className?: string
}

export default function GlobalShareAction({
  label = 'شارك المنصة + QR',
  className = '',
}: Props) {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

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
