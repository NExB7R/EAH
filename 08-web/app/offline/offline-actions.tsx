'use client'
import { IcRefresh } from '@/components/eah-icons'

export default function OfflineActions() {
  return (
    <div className="off__actions">
      <button
        type="button"
        className="off__btn off__btn--primary"
        onClick={() => window.location.reload()}
      >
        <IcRefresh /> حاول تاني
      </button>
    </div>
  )
}
