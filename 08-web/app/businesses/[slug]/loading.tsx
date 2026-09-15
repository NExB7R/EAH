export default function Loading() {
  return (
    <div className="bskel">
      <div className="bskel__hero">
        <div className="bskel__bar bskel__bar--title" />
        <div className="bskel__bar bskel__bar--sub" />
      </div>
      <div className="bskel__grid">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bskel__card" />
        ))}
      </div>
      <style>{`
        .bskel {
          max-width: 1000px;
          margin: 0 auto;
          padding: 100px 20px 60px;
        }
        .bskel__hero {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 30px;
        }
        .bskel__bar {
          background: rgba(168, 85, 247, 0.08);
          border-radius: 12px;
          position: relative;
          overflow: hidden;
        }
        .bskel__bar::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.2), transparent);
          transform: translateX(-100%);
          animation: bskel-shimmer 1.6s infinite;
        }
        @keyframes bskel-shimmer {
          to { transform: translateX(100%); }
        }
        .bskel__bar--title { width: 60%; height: 40px; }
        .bskel__bar--sub { width: 40%; height: 20px; }
        .bskel__grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }
        .bskel__card {
          aspect-ratio: 4 / 3;
          background: rgba(168, 85, 247, 0.05);
          border: 1px solid rgba(168, 85, 247, 0.1);
          border-radius: 16px;
          position: relative;
          overflow: hidden;
        }
        .bskel__card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.15), transparent);
          transform: translateX(-100%);
          animation: bskel-shimmer 1.6s infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .bskel__bar::after, .bskel__card::after { animation: none; }
        }
      `}</style>
    </div>
  )
}
