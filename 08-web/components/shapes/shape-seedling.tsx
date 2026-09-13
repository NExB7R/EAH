export default function ShapeSeedling() {
  return (
    <svg viewBox="0 0 200 200" className="shp shp--seedling" aria-hidden>
      <defs>
        <linearGradient id="seed-grad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#4ADE80" />
        </linearGradient>
      </defs>

      {/* الساق */}
      <path
        d="M100 170 L100 90"
        fill="none"
        stroke="url(#seed-grad)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* الورقة اليمين */}
      <path
        d="M100 100 Q130 70 145 90 Q120 105 100 100"
        fill="none"
        stroke="url(#seed-grad)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* الورقة الشمال */}
      <path
        d="M100 110 Q70 80 55 100 Q80 115 100 110"
        fill="none"
        stroke="url(#seed-grad)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* التربة */}
      <path
        d="M60 175 Q100 165 140 175"
        fill="none"
        stroke="url(#seed-grad)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* نقط دائرية صغيرة (بذور) */}
      {[
        [70, 130], [130, 130], [50, 145], [150, 145],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="2" fill="#4ADE80" opacity="0.6" />
      ))}
    </svg>
  )
}
