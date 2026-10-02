'use client'

import { useState } from 'react'
import Image, { type ImageProps } from 'next/image'
import Watermark from './watermark'
import styles from './wm-image.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Watermarked Image
// next/image + watermark + fallback
// ⚠️ URLs خارجية غير موثوقة → unoptimized (تجنب 502 من Vercel)
// ═══════════════════════════════════════════════════════════

const TRUSTED_HOSTS = ['supabase.co', 'res.cloudinary.com']

function isTrusted(src: ImageProps['src']): boolean {
  if (typeof src !== 'string') return false
  if (src.startsWith('/')) return true
  return TRUSTED_HOSTS.some((h) => src.includes(h))
}

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

  const trusted = isTrusted(props.src)

  const img = (
    <Image
      className={className}
      alt={alt}
      unoptimized={!trusted}
      onError={() => setFailed(true)}
      {...props}
    />
  )

  if (noWatermark) return img

  return <Watermark>{img}</Watermark>
}
