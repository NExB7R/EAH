'use client'
import { useState, type ReactNode } from 'react'

type Tab = { key: string; label: string; count?: number; content: ReactNode }

export default function Tabs({ tabs, defaultKey }: { tabs: Tab[]; defaultKey?: string }) {
  const [active, setActive] = useState(defaultKey ?? tabs[0]?.key)
  const current = tabs.find((t) => t.key === active) ?? tabs[0]
  return (
    <>
      <div className="e-tabs" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={active === t.key}
            className={`e-tab ${active === t.key ? 'is-active' : ''}`}
            onClick={() => setActive(t.key)}
          >
            {t.label}
            {typeof t.count === 'number' && <span className="e-tab__count">{t.count}</span>}
          </button>
        ))}
      </div>
      <div className="e-tabs__panel" style={{ marginTop: 16 }}>{current?.content}</div>
    </>
  )
}
