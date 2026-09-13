export default function ShapePizza() {
  return (
    <svg viewBox="0 0 200 200" className="shp shp--pizza" aria-hidden>
      <defs>
        <linearGradient id="pizza-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="50%" stopColor="#E8C79A" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
      </defs>

      {/* الدايرة الأساسية */}
      <circle cx="100" cy="100" r="78" fill="none" stroke="url(#pizza-grad)" strokeWidth="2.5" />

      {/* حدود الشرائح (8 شرائح) */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = (deg * Math.PI) / 180
        const x1 = 100
        const y1 = 100
        const x2 = 100 + 78 * Math.cos(rad)
        const y2 = 100 + 78 * Math.sin(rad)
        return (
          <line
            key={deg}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="url(#pizza-grad)"
            strokeWidth="1.2"
            opacity="0.4"
          />
        )
      })}

      {/* دوائر صغيرة (توبينج) */}
      {[
        [120, 70], [145, 95], [130, 130], [85, 135],
        [70, 95], [95, 120], [110, 90], [140, 65],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="4" fill="url(#pizza-grad)" opacity="0.7" />
      ))}

      {/* دوائر نقط صغيرة (زعتر) */}
      {[
        [105, 60], [155, 85], [120, 155], [65, 120], [150, 145], [80, 70],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="1.8" fill="#A855F7" opacity="0.8" />
      ))}
    </svg>
  )
}
