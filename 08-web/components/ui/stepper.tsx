'use client'

type Step = { key: string; label: string }

export default function Stepper({
  steps,
  activeKey,
}: {
  steps: Step[]
  activeKey: string
}) {
  const activeIdx = steps.findIndex((s) => s.key === activeKey)
  return (
    <div className="e-stepper" role="tablist">
      {steps.map((s, i) => {
        const isDone = i < activeIdx
        const isActive = i === activeIdx
        return (
          <span key={s.key} style={{ display: 'contents' }}>
            <button
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`e-step ${isDone ? 'is-done' : ''} ${isActive ? 'is-active' : ''}`}
            >
              <span className="e-step__num">{isDone ? '✓' : i + 1}</span>
              <span>{s.label}</span>
            </button>
            {i < steps.length - 1 && <span className="e-stepper__sep" aria-hidden />}
          </span>
        )
      })}
    </div>
  )
}
