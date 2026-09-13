'use client'
import { useEffect, useState } from 'react'

export default function OpenNowBadge({ workingHours }: { workingHours: any }) {
  const [isOpen, setIsOpen] = useState<boolean | null>(null)

  useEffect(() => {
    if (!workingHours) { setIsOpen(false); return }
    const check = () => {
      const now = new Date()
      const egypt = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Cairo' }))
      const dayMap: Record<number, string> = {
        0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat'
      }
      const day = dayMap[egypt.getDay()]
      const hh = String(egypt.getHours()).padStart(2, '0')
      const mm = String(egypt.getMinutes()).padStart(2, '0')
      const time = `${hh}:${mm}`
      const dayData = workingHours[day]
      if (!dayData?.open || !dayData?.close) { setIsOpen(false); return }
      const { open, close } = dayData
      if (open <= close) setIsOpen(time >= open && time < close)
      else setIsOpen(time >= open || time < close)
    }
    check()
    const interval = setInterval(check, 60000)
    return () => clearInterval(interval)
  }, [workingHours])

  if (isOpen === null) return null

  return (
    <span className={`onb ${isOpen ? 'onb--open' : 'onb--closed'}`}>
      <span className="onb__dot" />
      {isOpen ? 'مفتوح الآن' : 'مقفول'}
    </span>
  )
}
