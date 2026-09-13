export default function ShapeLightning() {
  return (
    <svg viewBox="0 0 200 200" className="shp shp--lightning" aria-hidden>
      <defs>
        <linearGradient id="bolt-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="50%" stopColor="#E8C79A" />
          <stop offset="100%" stopColor="#FB923C" />
        </linearGradient>
      </defs>

      {/* الصاعقة الأساسية */}
      <path
        d="M110 20 L60 100 L95 100 L85 180 L140 95 L100 95 L125 20 Z"
        fill="none"
        stroke="url(#bolt-grad)"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* خطوط سرعة جانبية */}
      <line x1="35" y1="60" x2="55" y2="60" stroke="#FB923C" strokeWidth="2" opacity="0.6" strokeLinecap="round" />
      <line x1="25" y1="80" x2="50" y2="80" stroke="#FB923C" strokeWidth="2" opacity="0.4" strokeLinecap="round" />
      <line x1="145" y1="120" x2="170" y2="120" stroke="#FB923C" strokeWidth="2" opacity="0.6" strokeLinecap="round" />
      <line x1="150" y1="140" x2="180" y2="140" stroke="#FB923C" strokeWidth="2" opacity="0.4" strokeLinecap="round" />

      {/* نقط حول الصاعقة (تأثير طاقة) */}
      {[
        [70, 40], [40, 100], [160, 80], [140, 160], [50, 150],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="2.5" fill="#FB923C" opacity="0.7" />
      ))}
    </svg>
  )
}
