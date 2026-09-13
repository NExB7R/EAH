'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import SectionRenderer from './renderer'
import {
  type DesignData, type Section, type SectionType,
  SECTION_LABELS, makeId, defaultProps, defaultDesign,
} from './types'
import { currentHomeDesign } from './current-design'

type Viewport = 'mobile' | 'tablet' | 'desktop'

const HISTORY_MAX = 30

export default function StudioShell({ initial }: { initial: DesignData | null }) {
  const [design, setDesign] = useState<DesignData>(initial ?? currentHomeDesign)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [viewport, setViewport] = useState<Viewport>('desktop')
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [dirty, setDirty] = useState(false)
  const [preview, setPreview] = useState(false)

  const history = useRef<DesignData[]>([])
  const future = useRef<DesignData[]>([])

  const push = useCallback((next: DesignData) => {
    history.current.push(design)
    if (history.current.length > HISTORY_MAX) history.current.shift()
    future.current = []
    setDesign(next)
    setDirty(true)
  }, [design])

  const undo = useCallback(() => {
    const prev = history.current.pop()
    if (!prev) return
    future.current.push(design)
    setDesign(prev)
    setDirty(true)
  }, [design])

  const redo = useCallback(() => {
    const next = future.current.pop()
    if (!next) return
    history.current.push(design)
    setDesign(next)
    setDirty(true)
  }, [design])

  // Auto-save (debounced)
  useEffect(() => {
    if (!dirty) return
    const t = setTimeout(async () => {
      setSaving(true)
      try {
        const res = await fetch('/api/studio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'home', data: design }),
        })
        if (res.ok) {
          setSavedAt(new Date())
          setDirty(false)
        }
      } finally {
        setSaving(false)
      }
    }, 1800)
    return () => clearTimeout(t)
  }, [design, dirty])

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo(); else undo()
      }
      if (e.key === 'Delete' && selectedId && !preview) {
        const tag = (e.target as HTMLElement)?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA') return
        e.preventDefault()
        push({ ...design, sections: design.sections.filter(s => s.id !== selectedId) })
        setSelectedId(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [design, selectedId, preview, push, undo, redo])

  const selected = useMemo(
    () => design.sections.find(s => s.id === selectedId) ?? null,
    [design.sections, selectedId]
  )

  const setSectionProps = (id: string, patch: Record<string, unknown>) => {
    push({
      ...design,
      sections: design.sections.map(s =>
        s.id === id ? { ...s, props: { ...s.props, ...patch } } : s
      ),
    })
  }

  const addSection = (type: SectionType) => {
    const s: Section = { id: makeId(), type, visible: true, props: defaultProps(type) }
    push({ ...design, sections: [...design.sections, s] })
    setSelectedId(s.id)
  }

  const removeSection = (id: string) => {
    push({ ...design, sections: design.sections.filter(s => s.id !== id) })
    if (selectedId === id) setSelectedId(null)
  }

  const duplicateSection = (id: string) => {
    const i = design.sections.findIndex(s => s.id === id)
    if (i < 0) return
    const copy: Section = { ...design.sections[i], id: makeId() }
    const next = [...design.sections]
    next.splice(i + 1, 0, copy)
    push({ ...design, sections: next })
  }

  const moveSection = (id: string, dir: -1 | 1) => {
    const i = design.sections.findIndex(s => s.id === id)
    if (i < 0) return
    const j = i + dir
    if (j < 0 || j >= design.sections.length) return
    const next = [...design.sections]
    ;[next[i], next[j]] = [next[j], next[i]]
    push({ ...design, sections: next })
  }

  const toggleVisible = (id: string) => {
    push({
      ...design,
      sections: design.sections.map(s =>
        s.id === id ? { ...s, visible: !s.visible } : s
      ),
    })
  }

  const forceSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'home', data: design }),
      })
      if (res.ok) {
        setSavedAt(new Date())
        setDirty(false)
        setTimeout(() => window.location.reload(), 800)
      } else {
        alert('فشل الحفظ — تأكد من تسجيل الدخول كـ super_admin')
      }
    } catch {
      alert('خطأ في الاتصال')
    } finally {
      setSaving(false)
    }
  }

  const resetAll = () => {
    if (!confirm('متأكد إنك عايز ترجع التصميم الافتراضي؟ كل تعديلاتك هتتمسح.')) return
    push(currentHomeDesign)
    setSelectedId(null)
  }

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(design, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `eah-design-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const canvasWidth = viewport === 'mobile' ? 400 : viewport === 'tablet' ? 800 : '100%'

  if (preview) {
    return (
      <div className="studio-preview">
        <button className="studio-preview__exit" onClick={() => setPreview(false)}>
          ← رجوع للاستوديو
        </button>
        <div className="studio-preview__canvas" style={{ background: design.theme.bgColor }}>
          {design.sections.filter(s => s.visible).map(s => (
            <SectionRenderer key={s.id} section={s} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="studio">
      {/* Top toolbar */}
      <header className="studio__top">
        <div className="studio__top-left">
          <span className="studio__logo">🎨 EAH Studio</span>
          <span className="studio__save-status">
            {saving ? '💾 جاري الحفظ...' : dirty ? '• تعديلات غير محفوظة' : savedAt ? `✓ محفوظ ${savedAt.toLocaleTimeString('ar-EG')}` : '✓ محفوظ'}
          </span>
        </div>
        <div className="studio__top-center">
          <div className="studio__viewports">
            {(['mobile','tablet','desktop'] as Viewport[]).map(v => (
              <button
                key={v}
                className={`studio__viewport ${viewport === v ? 'is-active' : ''}`}
                onClick={() => setViewport(v)}
                title={v}
              >
                {v === 'mobile' ? '📱' : v === 'tablet' ? '📱' : '🖥️'}
              </button>
            ))}
          </div>
        </div>
        <div className="studio__top-right">
          <button className="studio__btn" onClick={undo} title="Ctrl+Z">↶</button>
          <button className="studio__btn" onClick={redo} title="Ctrl+Shift+Z">↷</button>
          <button className="studio__btn" onClick={resetAll} title="إعادة ضبط">🔄</button>
          <button className="studio__btn" onClick={exportJSON} title="تنزيل JSON">⬇</button>
          <button className="studio__btn" onClick={() => window.location.reload()} title="إعادة تحميل">🔄</button>
          <button className="studio__btn studio__btn--primary" onClick={forceSave} disabled={saving}>
            {saving ? '💾 جاري الحفظ...' : '💾 احفظ + حدّث الموقع'}
          </button>
          <button className="studio__btn" onClick={() => setPreview(true)} title="معاينة">👁️</button>
        </div>
      </header>

      {/* 3 panels */}
      <div className="studio__body">
        {/* Left: Library */}
        <aside className="studio__left">
          <h3 className="studio__panel-title">📚 مكتبة الأقسام</h3>
          <div className="studio__library">
            {(Object.keys(SECTION_LABELS) as SectionType[]).map(t => (
              <button
                key={t}
                className="studio__lib-item"
                onClick={() => addSection(t)}
              >
                <span className="studio__lib-emoji">{SECTION_LABELS[t].emoji}</span>
                <span className="studio__lib-label">{SECTION_LABELS[t].label}</span>
                <span className="studio__lib-add">+</span>
              </button>
            ))}
          </div>

          <h3 className="studio__panel-title" style={{ marginTop: 24 }}>🧱 الأقسام الحالية</h3>
          <div className="studio__layers">
            {design.sections.map((s, i) => (
              <div
                key={s.id}
                className={`studio__layer ${selectedId === s.id ? 'is-active' : ''} ${!s.visible ? 'is-hidden' : ''}`}
                onClick={() => setSelectedId(s.id)}
              >
                <span className="studio__layer-emoji">{SECTION_LABELS[s.type].emoji}</span>
                <span className="studio__layer-label">{SECTION_LABELS[s.type].label}</span>
                <div className="studio__layer-actions" onClick={e => e.stopPropagation()}>
                  <button onClick={() => moveSection(s.id, -1)} disabled={i === 0} title="فوق">↑</button>
                  <button onClick={() => moveSection(s.id, 1)} disabled={i === design.sections.length - 1} title="تحت">↓</button>
                  <button onClick={() => toggleVisible(s.id)} title={s.visible ? 'إخفاء' : 'إظهار'}>
                    {s.visible ? '👁️' : '🚫'}
                  </button>
                  <button onClick={() => duplicateSection(s.id)} title="تكرار">📋</button>
                  <button onClick={() => removeSection(s.id)} className="danger" title="حذف">🗑️</button>
                </div>
              </div>
            ))}
            {design.sections.length === 0 && (
              <div className="studio__layers-empty">مفيش أقسام — ضيف من المكتبة فوق</div>
            )}
          </div>
        </aside>

        {/* Center: Canvas */}
        <main className="studio__center">
          <div
            className="studio__canvas"
            style={{
              width: canvasWidth,
              background: design.theme.bgColor,
            }}
          >
            {design.sections.filter(s => s.visible).map(s => (
              <div
                key={s.id}
                className={`studio__canvas-block ${selectedId === s.id ? 'is-active' : ''}`}
                onClick={() => setSelectedId(s.id)}
              >
                <span className="studio__canvas-badge">
                  {SECTION_LABELS[s.type].emoji} {SECTION_LABELS[s.type].label}
                </span>
                <SectionRenderer section={s} />
              </div>
            ))}
            {design.sections.filter(s => s.visible).length === 0 && (
              <div className="studio__canvas-empty">
                <span>🎨</span>
                <p>اختار قسم من المكتبة على اليسار</p>
              </div>
            )}
          </div>
        </main>

        {/* Right: Inspector */}
        <aside className="studio__right">
          <h3 className="studio__panel-title">
            {selected ? `⚙️ ${SECTION_LABELS[selected.type].label}` : '🎨 الثيم'}
          </h3>

          {selected ? (
            <div className="studio__inspector">
              <FieldText
                label="النص الأساسي / العنوان"
                value={(selected.props as any).title ?? ''}
                onChange={v => setSectionProps(selected.id, { title: v })}
              />
              <FieldText
                label="النص الفرعي"
                value={(selected.props as any).subtitle ?? ''}
                onChange={v => setSectionProps(selected.id, { subtitle: v })}
              />
              {(selected.type === 'hero' || selected.type === 'cta') && (
                <>
                  <FieldText
                    label="نص الزرار"
                    value={(selected.props as any).ctaText ?? ''}
                    onChange={v => setSectionProps(selected.id, { ctaText: v })}
                  />
                  <FieldText
                    label="رابط الزرار"
                    value={(selected.props as any).ctaHref ?? ''}
                    onChange={v => setSectionProps(selected.id, { ctaHref: v })}
                  />
                </>
              )}
              {(selected.type === 'featured' || selected.type === 'trending' || selected.type === 'offers') && (
                <FieldNumber
                  label="عدد العناصر"
                  value={(selected.props as any).count ?? 4}
                  onChange={v => setSectionProps(selected.id, { count: v })}
                />
              )}
              {selected.type === 'banner' && (
                <>
                  <FieldText
                    label="النص"
                    value={(selected.props as any).text ?? ''}
                    onChange={v => setSectionProps(selected.id, { text: v })}
                  />
                  <FieldColor
                    label="اللون"
                    value={(selected.props as any).color ?? '#A855F7'}
                    onChange={v => setSectionProps(selected.id, { color: v })}
                  />
                </>
              )}
              {selected.type === 'footer' && (
                <FieldText
                  label="حقوق النشر"
                  value={(selected.props as any).copyright ?? ''}
                  onChange={v => setSectionProps(selected.id, { copyright: v })}
                />
              )}
            </div>
          ) : (
            <div className="studio__inspector">
              <FieldColor
                label="اللون الأساسي"
                value={design.theme.primaryColor}
                onChange={v => push({ ...design, theme: { ...design.theme, primaryColor: v } })}
              />
              <FieldColor
                label="لون الخلفية"
                value={design.theme.bgColor}
                onChange={v => push({ ...design, theme: { ...design.theme, bgColor: v } })}
              />
              <FieldText
                label="الخط"
                value={design.theme.fontFamily}
                onChange={v => push({ ...design, theme: { ...design.theme, fontFamily: v } })}
              />
              <div className="studio__hint">💡 اضغط على أي قسم في اللوحة عشان تعدّل خصائصه</div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

function FieldText({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="studio__field">
      <span className="studio__field-label">{label}</span>
      <input
        className="studio__input"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </label>
  )
}

function FieldNumber({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="studio__field">
      <span className="studio__field-label">{label}</span>
      <input
        type="number"
        min={1}
        max={12}
        className="studio__input"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
    </label>
  )
}

function FieldColor({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="studio__field">
      <span className="studio__field-label">{label}</span>
      <div className="studio__color-row">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="studio__color"
        />
        <input
          className="studio__input studio__input--sm"
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      </div>
    </label>
  )
}
