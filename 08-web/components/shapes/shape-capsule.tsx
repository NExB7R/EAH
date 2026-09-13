export default function ShapeCapsule() {
  return (
    <svg viewBox="0 0 200 200" className="shp shp--capsule" aria-hidden>
      <defs>
        <linearGradient id="cap-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4ADE80" />
          <stop offset="50%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#4ADE80" />
        </linearGradient>
      </defs>

      {/* الكبسولة الرئيسية */}
      <rect
        x="30" y="80"
        width="140" height="40"
        rx="20"
        fill="none"
        stroke="url(#cap-grad)"
        strokeWidth="2.5"
      />

      {/* الخط الفاصل في النص */}
      <line x1="100" y1="80" x2="100" y2="120" stroke="url(#cap-grad)" strokeWidth="1.5" />

      {/* خطوط طولية داخلية */}
      <rect
        x="40" y="88"
        width="50" height="24"
        rx="12"
        fill="url(#cap-grad)"
        opacity="0.15"
      />

      {/* نبضات جانبية */}
      <circle cx="45" cy="100" r="3" fill="#4ADE80" opacity="0.8" />
      <circle cx="155" cy="100" r="3" fill="#4ADE80" opacity="0.8" />

      {/* شرطة على الجانب (شكل الدوا) */}
      <line x1="55" y1="100" x2="85" y2="100" stroke="#4ADE80" strokeWidth="2" opacity="0.6" />
    </svg>
  )
}
