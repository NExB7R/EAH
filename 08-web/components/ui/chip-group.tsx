'use client'

type Item = { key: string; label: string; emoji?: string }

type Props = {
  items: Item[]
  value: string | string[] | null
  onChange: (value: string | string[] | null) => void
  multiple?: boolean
  scroll?: boolean
}

export default function ChipGroup({ items, value, onChange, multiple = false, scroll = false }: Props) {
  const selected = Array.isArray(value) ? value : value ? [value] : []

  const toggle = (k: string) => {
    if (multiple) {
      const arr = Array.isArray(value) ? value : []
      onChange(arr.includes(k) ? arr.filter((x) => x !== k) : [...arr, k])
    } else {
      onChange(value === k ? null : k)
    }
  }

  return (
    <div className={`e-chipgroup ${scroll ? 'e-chipgroup--scroll' : ''}`}>
      {items.map((it) => (
        <button
          key={it.key}
          type="button"
          className={`e-chip ${selected.includes(it.key) ? 'is-active' : ''}`}
          onClick={() => toggle(it.key)}
          aria-pressed={selected.includes(it.key)}
        >
          {it.emoji && <span>{it.emoji}</span>}
          {it.label}
        </button>
      ))}
    </div>
  )
}
