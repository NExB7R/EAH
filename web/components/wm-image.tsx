import Image, { type ImageProps } from 'next/image'
import Watermark from './watermark'

// ═══════════════════════════════════════════════════════════
// EAH — Watermarked Image
// next/image + العلامة المائية
// ═══════════════════════════════════════════════════════════

type WmImageProps = ImageProps & {
  // noWatermark → بدون علامة (للـ avatars / icons)
  noWatermark?: boolean
}

export default function WmImage({
  noWatermark = false,
  className,
  alt = '',
  ...props
}: WmImageProps) {
  if (noWatermark) {
    return <Image className={className} alt={alt} {...props} />
  }

  return (
    <Watermark>
      <Image className={className} alt={alt} {...props} />
    </Watermark>
  )
}
