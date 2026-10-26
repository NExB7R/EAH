import Image from 'next/image'
import Link from 'next/link'
import styles from './logo.module.css'

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type Variant = 'full' | 'compact' | 'mark' | 'crown'

type LogoProps = {
  size?: Size
  variant?: Variant
  className?: string
  href?: string | null
}

export default function Logo({
  size = 'md',
  variant = 'full',
  className = '',
  href = '/',
}: LogoProps) {
  const sizeCls = styles[size]
  const variantCls = variant === 'crown' ? styles.crownOnly : ''
  const forceHeroSize = size === 'lg' ? styles.forceMobileHero : ''
  const cls = [styles.logo, sizeCls, variantCls, forceHeroSize, className].filter(Boolean).join(' ')

  const inner = (
    <>
      {variant !== 'crown' && <span className={styles.glow} aria-hidden />}

      {variant !== 'crown' && (
        <Image
          className={styles.word}
          src="/eah-word.webp"
          alt="EAH"
          width={546}
          height={231}
          priority
          fetchPriority="high"
          decoding="async"
          sizes="(max-width: 640px) 280px, (max-width: 1024px) 340px, 380px"
          {...(size === 'lg' ? { elementtiming: 'hero-logo' } : {})}
        />
      )}

      <Image
        className={styles.crown}
        src="/eah-crown.webp"
        alt=""
        aria-hidden
        width={489}
        height={264}
        sizes="(max-width: 640px) 140px, (max-width: 1024px) 160px, 180px"
        priority
        fetchPriority="high"
        decoding="async"
      />

      {variant === 'full' && (
        <span className={styles.slogan} aria-hidden>
          <span>اللى نفسك فيه</span>
          <span className={styles.punct}>؟</span>
        </span>
      )}
    </>
  )

  if (href) {
    return (
      <Link href={href} className={cls} aria-label="EAH — اللى نفسك فيه ؟">
        {inner}
      </Link>
    )
  }

  return (
    <span className={cls} aria-label="EAH — اللى نفسك فيه ؟">
      {inner}
    </span>
  )
}
