'use client'

/**
 * Splash — Skeleton Shimmer (2026)
 * بدل dots دوّارة: هيكل الصفحة القادمة بـ shimmer ناعم.
 * يوحي إن الموقع فتح فوراً وأسرع.
 */
export default function SplashScreen() {
  return (
    <div className="splash-skeleton" aria-hidden>
      {/* Hero skeleton */}
      <div className="sk-hero">
        <div className="sk-logo" />
        <div className="sk-line sk-line--title" />
        <div className="sk-line sk-line--sub" />
        <div className="sk-search" />
      </div>

      {/* Sections skeletons */}
      {[0, 1, 2].map((i) => (
        <div key={i} className="sk-section">
          <div className="sk-line sk-line--heading" />
          <div className="sk-row">
            {[0, 1, 2, 3].map((j) => (
              <div key={j} className="sk-card" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
