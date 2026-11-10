'use client'

import { useState } from 'react'
import { UserIcon, LockIcon, ClockIcon } from '@/components/icons'
import { SecurityTab } from './security-tab'
import { ActivityTab } from './activity-tab'
import styles from './profile-tabs.module.css'

type Tab = 'profile' | 'security' | 'activity'

const TABS: { key: Tab; label: string; Icon: typeof UserIcon }[] = [
  { key: 'profile', label: 'البروفايل', Icon: UserIcon },
  { key: 'security', label: 'الأمان', Icon: LockIcon },
  { key: 'activity', label: 'النشاط', Icon: ClockIcon },
]

type Props = {
  profileContent: React.ReactNode
}

export function ProfileTabs({ profileContent }: Props) {
  const [tab, setTab] = useState<Tab>('profile')
  const [toast, setToast] = useState<string | null>(null)

  const onComingSoon = (feature: string) => {
    setToast(`${feature} — قريبًا في تحديث قادم`)
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className={styles.tabs}>
      <nav className={styles.tabBar} role="tablist" aria-label="أقسام البروفايل">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            type="button"
            aria-selected={tab === t.key}
            aria-controls={`panel-${t.key}`}
            className={`${styles.tabBtn} ${tab === t.key ? styles.tabBtnActive : ''}`}
            onClick={() => setTab(t.key)}
          >
            <t.Icon size={16} />
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      <div id={`panel-${tab}`} role="tabpanel" className={styles.panelBody}>
        {tab === 'profile' && profileContent}
        {tab === 'security' && <SecurityTab onComingSoon={onComingSoon} />}
        {tab === 'activity' && <ActivityTab />}
      </div>

      {toast && (
        <div className={styles.toast} role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </div>
  )
}
