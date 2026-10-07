'use client'

import { useState } from 'react'
import { MicIcon } from './icons'
import VoiceSearch from './voice-search'

type Props = {
  className?: string
  size?: number
  tooltip?: string
  /** لو موجود → يستخدم callback بدل النقل لـ /explore */
  onResult?: (text: string) => void
}

export default function VoiceSearchButton({
  className = '',
  size = 18,
  tooltip = 'بحث صوتي',
  onResult,
}: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => setOpen(true)}
        aria-label="بحث صوتي"
        data-tooltip={tooltip}
      >
        <MicIcon size={size} />
      </button>
      <VoiceSearch open={open} onClose={() => setOpen(false)} onResult={onResult} />
    </>
  )
}
