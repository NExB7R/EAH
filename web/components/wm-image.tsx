'use client'

import { useState } from 'react'
import Image, { type ImageProps } from 'next/image'
import Watermark from './watermark'
import styles from './wm-image.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Watermarked Image
// next/image + watermark + fallback gradient عند الفشل
// ═══════════════════════════════════════════════════════════

type WmImageProps = ImageProps & {
  noWatermark?: boolean
}

export default function WmImage({
  noWatermark = false,
  className,
  alt = '',
  ...props
}: WmImageProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return <div className={`${className ?? ''} ${styles.failed}`} aria-hidden />
  }

  const img = <Image className={className} alt={alt} onError={() => setFailed(true)} {...props} />

  if (noWatermark) return img

  return <Watermark>{img}</Watermark>
}
