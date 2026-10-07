'use client'

import { useState } from 'react'
import { MicIcon } from './icons'
import VoiceSearch from './voice-search'

type Props = {
  className?: string
  size?: number
  tooltip?: string
}

export default function VoiceSearchButton({
  className = '',
  size = 18,
  tooltip = 'بحث صوتي',
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
      <VoiceSearch open={open} onClose={() => setOpen(false)} />
    </>
  )
}
