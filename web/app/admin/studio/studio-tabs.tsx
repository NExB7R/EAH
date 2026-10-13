'use client'

import { useState } from 'react'
import { SparklesIcon, FileTextIcon } from '@/components/icons'
import type { FeatureFlags } from '@/lib/features-shared'
import type { AppTexts } from '@/lib/app-texts'
import FlagsPanel from './flags-panel'
import TextPanel from './text-panel'
import styles from './studio.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Studio Tabs
// الميزات / النصوص
// ═══════════════════════════════════════════════════════════

type Props = {
  flags: FeatureFlags
  texts: AppTexts
}

type TabKey = 'flags' | 'texts'

const TABS: { key: TabKey; label: string; Icon: typeof SparklesIcon; desc: string }[] = [
  {
    key: 'flags',
    label: 'الميزات',
    Icon: SparklesIcon,
    desc: 'تفعيل أو إيقاف ميزات المنصة',
  },
  {
    key: 'texts',
    label: 'النصوص',
    Icon: FileTextIcon,
    desc: 'تعديل النصوص الحيوية',
  },
]

export default function StudioTabs({ flags, texts }: Props) {
  const [tab, setTab] = useState<TabKey>('flags')

  return (
    <>
      <nav className={styles.tabs} aria-label="أقسام الاستوديو">
        {TABS.map((t) => {
          const active = t.key === tab
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`${styles.tab} ${active ? styles.tabActive : ''}`}
              aria-selected={active}
              role="tab"
            >
              <span className={styles.tabIcon}>
                <t.Icon size={16} />
              </span>
              <span className={styles.tabLabel}>{t.label}</span>
              <span className={styles.tabDesc}>{t.desc}</span>
            </button>
          )
        })}
      </nav>

      {tab === 'flags' && <FlagsPanel initial={flags} />}
      {tab === 'texts' && <TextPanel initial={texts} />}
    </>
  )
}
