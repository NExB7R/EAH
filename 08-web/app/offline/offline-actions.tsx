'use client'

export default function OfflineActions() {
  return (
    <div className="off__actions">
      <button
        type="button"
        className="off__btn off__btn--primary"
        onClick={() => window.location.reload()}
      >
        🔄 حاول تاني
      </button>
      <a href="/" className="off__btn off__btn--ghost">
        الرئيسية
      </a>
    </div>
  )
}
