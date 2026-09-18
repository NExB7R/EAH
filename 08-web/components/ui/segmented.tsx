'use client'

type Option = { key: string; label: string }

export default function Segmented({
  options,
  value,
  onChange,
}: {
  options: Option[]
  value: string
  onChange: (key: string) => void
}) {
  return (
    <div className="e-segmented" role="tablist">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          role="tab"
          aria-selected={value === o.key}
          className={`e-segmented__btn ${value === o.key ? 'is-active' : ''}`}
          onClick={() => onChange(o.key)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
