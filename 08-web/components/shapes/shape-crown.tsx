export default function ShapeCrown() {
  return (
    <svg viewBox="0 0 200 200" className="shp shp--crown" aria-hidden>
      <defs>
        <linearGradient id="crown-shape-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8C79A" />
          <stop offset="50%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#E8C79A" />
        </linearGradient>
      </defs>

      {/* التاج */}
      <path
        d="M40 140 L30 80 L65 110 L100 50 L135 110 L170 80 L160 140 Z"
        fill="none"
        stroke="url(#crown-shape-grad)"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* القاعدة */}
      <path
        d="M40 155 Q100 165 160 155"
        fill="none"
        stroke="url(#crown-shape-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* جواهر */}
      <circle cx="30" cy="80" r="5" fill="#E8C79A" opacity="0.9" />
      <circle cx="100" cy="50" r="6" fill="#A855F7" opacity="0.9" />
      <circle cx="170" cy="80" r="5" fill="#E8C79A" opacity="0.9" />

      {/* نجوم صغيرة */}
      {[
        [60, 60], [140, 60], [100, 130], [70, 140], [130, 140],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="1.5" fill="#E8C79A" opacity="0.7" />
      ))}
    </svg>
  )
}
