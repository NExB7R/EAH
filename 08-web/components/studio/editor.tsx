'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import {
  type DesignData, type Section, type SectionType,
  SECTION_LABELS, makeId, defaultProps,
} from './types'
import { currentHomeDesign } from './current-design'
import Inspector from './inspector'
import { IcBan, IcCheck, IcDown, IcEye, IcList, IcMobile, IcRefresh, IcTrash, IcUp } from '@/components/eah-icons'

type Viewport = 'desktop' | 'tablet' | 'mobile'

export default function StudioEditor({ initial }: { initial: DesignData | null }) {
  const [design, setDesign] = useState<DesignData>(initial ?? currentHomeDesign)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [previewKey, setPreviewKey] = useState(0)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [viewport, setViewport] = useState<Viewport>('desktop')
  const [showCmd, setShowCmd] = useState(false)
  const [inspectorTab, setInspectorTab] = useState<'content' | 'style'>('content')
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [history, setHistory] = useState<DesignData[]>([initial ?? currentHomeDesign])
  const [historyIndex, setHistoryIndex] = useState(0)

  const selected = design.sections.find(s => s.id === selectedId) ?? null
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null)

  const update = useCallback((next: DesignData) => {
    setDesign(next)
    setSaved(false)
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1)
      const nextHistory = [...trimmed, next].slice(-50)
      setHistoryIndex(nextHistory.length - 1)
      return nextHistory
    })
  }, [historyIndex])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1
      setHistoryIndex(prevIdx)
      setDesign(history[prevIdx])
      setSaved(false)
    }
  }, [historyIndex, history])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1
      setHistoryIndex(nextIdx)
      setDesign(history[nextIdx])
      setSaved(false)
    }
  }, [historyIndex, history])

  const save = useCallback(async (data: DesignData) => {
    setSaving(true)
    try {
      const res = await fetch('/api/studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'home', data }),
      })
      if (res.ok) {
        setSaved(true)
        setLastSaved(new Date())
        setTimeout(() => setPreviewKey(k => k + 1), 400)
      }
    } finally {
      setSaving(false)
    }
  }, [])

  // ═══ Live preview: postMessage to iframe ═══
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.data?.type === 'EAH_PREVIEW_READY') {
        iframeRef.current?.contentWindow?.postMessage(
          { type: 'EAH_DESIGN_UPDATE', design },
          '*'
        )
      }
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [design])

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'EAH_DESIGN_UPDATE', design },
      '*'
    )
  }, [design])

  // ═══ Keyboard: undo/redo ═══
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault()
          redo()
        } else {
          e.preventDefault()
          undo()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo])

  // Auto-save
  useEffect(() => {
    if (saved) return
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => save(design), 2000)
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current) }
  }, [design, saved, save])

  // Cmd+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowCmd(c => !c)
      }
      if (e.key === 'Escape') {
        setShowCmd(false)
        setShowAddMenu(false)
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        save(design)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [design, save])

  function addSection(type: SectionType) {
    const s: Section = { id: makeId(), type, visible: true, props: defaultProps(type) }
    update({ ...design, sections: [...design.sections, s] })
    setSelectedId(s.id)
    setShowAddMenu(false)
  }

  function removeSection(id: string) {
    if (!confirm('متأكد عايز تحذف القسم؟')) return
    update({ ...design, sections: design.sections.filter(s => s.id !== id) })
    if (selectedId === id) setSelectedId(null)
  }

  function duplicateSection(id: string) {
    const i = design.sections.findIndex(s => s.id === id)
    if (i < 0) return
    const copy: Section = { ...design.sections[i], id: makeId() }
    const next = [...design.sections]
    next.splice(i + 1, 0, copy)
    update({ ...design, sections: next })
    setSelectedId(copy.id)
  }

  function moveSection(id: string, dir: -1 | 1) {
    const i = design.sections.findIndex(s => s.id === id)
    const j = i + dir
    if (i < 0 || j < 0 || j >= design.sections.length) return
    const next = [...design.sections]
    ;[next[i], next[j]] = [next[j], next[i]]
    update({ ...design, sections: next })
  }

  function toggleVisible(id: string) {
    update({
      ...design,
      sections: design.sections.map(s => s.id === id ? { ...s, visible: !s.visible } : s),
    })
  }

  function setProp(key: string, value: any) {
    if (!selected) return
    update({
      ...design,
      sections: design.sections.map(s =>
        s.id === selected.id ? { ...s, props: { ...s.props, [key]: value } } : s
      ),
    })
  }

  const viewportWidth = viewport === 'mobile' ? 400 : viewport === 'tablet' ? 768 : '100%'

  return (
    <div className="ed">
      {/* ═══ TOP BAR ═══ */}
      <header className="ed__top">
        <div className="ed__brand">
          
          <span className="ed__brand-name">EAH Studio</span>
          <span className="ed__brand-version">2026</span>
        </div>

        <div className="ed__viewport-switcher">
          {(['desktop', 'tablet', 'mobile'] as Viewport[]).map(v => (
            <button
              key={v}
              className={`ed__vp ${viewport === v ? 'is-active' : ''}`}
              onClick={() => setViewport(v)}
              title={v}
            >
              {v === 'desktop' ? (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              ) : v === 'tablet' ? (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18.01"/></svg>
              ) : (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18.01"/></svg>
              )}
            </button>
          ))}
        </div>

        <div className="ed__actions">
          <button className="ed__kbd-btn" onClick={() => setShowCmd(true)}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <span>أوامر</span>
            <span className="ed__kbd">⌘K</span>
          </button>
          <button
            className="ed__action-btn"
            onClick={undo}
            disabled={historyIndex <= 0}
            title="تراجع (⌘Z)"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
          </button>
          <button
            className="ed__action-btn"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            title="إعادة (⌘⇧Z)"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>
          </button>
          <button
            className="ed__action-btn"
            onClick={() => { if (confirm('إعادة تعيين للافتراضي؟')) update(currentHomeDesign) }}
            title="إعادة تعيين"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
          </button>
          <button
            className="ed__publish"
            onClick={() => save(design)}
            disabled={saving}
          >
            {saving ? (
              <><span className="ed__spinner" /> جاري النشر</>
            ) : saved ? (
              <><IcCheck /> منشور</>
            ) : (
              <>📤 انشر التحديثات</>
            )}
          </button>
        </div>
      </header>

      {/* ═══ BODY ═══ */}
      <div className={`ed__body ${selected ? 'has-inspector' : ''}`}>
        {/* ═══ LEFT SIDEBAR ═══ */}
        <aside className="ed__sidebar">
          <button
            className={`ed__add ${showAddMenu ? 'is-open' : ''}`}
            onClick={() => setShowAddMenu(!showAddMenu)}
          >
            <span className="ed__add-icon">{showAddMenu ? '×' : '+'}</span>
            <span>{showAddMenu ? 'إلغاء' : 'إضافة قسم'}</span>
          </button>

          {showAddMenu && (
            <div className="ed__add-list">
              {(Object.keys(SECTION_LABELS) as SectionType[]).map(t => (
                <button key={t} className="ed__add-item" onClick={() => addSection(t)}>
                  <span className="ed__add-emoji">{SECTION_LABELS[t].emoji}</span>
                  <span className="ed__add-label">{SECTION_LABELS[t].label}</span>
                  <span className="ed__add-arrow">+</span>
                </button>
              ))}
            </div>
          )}

          <div className="ed__sections">
            {design.sections.map((s, i) => (
              <div
                key={s.id}
                className={`ed__sec ${selectedId === s.id ? 'is-active' : ''} ${!s.visible ? 'is-hidden' : ''}`}
                onClick={() => setSelectedId(s.id)}
              >
                <div className="ed__sec-main">
                  <span className="ed__sec-emoji">{SECTION_LABELS[s.type].emoji}</span>
                  <span className="ed__sec-label">{SECTION_LABELS[s.type].label}</span>
                </div>
                <div className="ed__sec-actions" onClick={e => e.stopPropagation()}>
                  <button onClick={() => moveSection(s.id, -1)} disabled={i === 0} title="فوق"><IcUp /></button>
                  <button onClick={() => moveSection(s.id, 1)} disabled={i === design.sections.length - 1} title="تحت"><IcDown /></button>
                  <button onClick={() => toggleVisible(s.id)} title={s.visible ? 'إخفاء' : 'إظهار'}>{s.visible ? <IcEye /> : <IcBan />}</button>
                  <button onClick={() => duplicateSection(s.id)} title="تكرار"><IcList /></button>
                  <button onClick={() => removeSection(s.id)} title="حذف" className="is-danger"><IcTrash /></button>
                </div>
              </div>
            ))}
          </div>

          <div className="ed__status-bar">
            {saving && <> جاري الحفظ</>}
            {!saving && !saved && <> غير محفوظ</>}
            {saved && lastSaved && <> محفوظ {lastSaved.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</>}
          </div>
        </aside>

        {/* ═══ CANVAS ═══ */}
        <main className="ed__canvas">
          <div className="ed__canvas-frame" style={{ width: viewportWidth }}>
            <div className="ed__canvas-bar">
              <span className="ed__canvas-url">eah-sq.vercel.app</span>
              <button className="ed__canvas-refresh" onClick={() => setPreviewKey(k => k + 1)} title="تحديث">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
              </button>
            </div>
            <iframe ref={iframeRef} key={previewKey} src="/" className="ed__iframe" title="معاينة" />
          </div>
        </main>

        {/* INSPECTOR */}
        {selected && (
          <Inspector
            section={selected}
            onChange={setProp}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>

      {/* ═══ COMMAND PALETTE ═══ */}
      {showCmd && (
        <div className="ed__cmd-overlay" onClick={() => setShowCmd(false)}>
          <div className="ed__cmd" onClick={e => e.stopPropagation()}>
            <input
              className="ed__cmd-input"
              placeholder="اكتب أمر... (مثلاً: احفظ، أضف قسم، إعادة تعيين)"
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const val = (e.target as HTMLInputElement).value.toLowerCase()
                  if (val.includes('احفظ') || val.includes('save')) save(design)
                  if (val.includes('إعادة') || val.includes('reset')) { if (confirm('إعادة تعيين؟')) update(currentHomeDesign) }
                  setShowCmd(false)
                }
              }}
            />
            <div className="ed__cmd-hints">
              <span>احفظ</span>
              <span><IcRefresh /> إعادة تعيين</span>
              <span><IcMobile /> تغيير الجهاز</span>
              <span>أضف قسم</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({
  label, value, onChange, multiline = false,
}: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean
}) {
  return (
    <div className="ed__field">
      <label className="ed__field-label">{label}</label>
      {multiline ? (
        <textarea className="ed__input ed__input--textarea" value={value} onChange={e => onChange(e.target.value)} rows={3} />
      ) : (
        <input className="ed__input" value={value} onChange={e => onChange(e.target.value)} />
      )}
    </div>
  )
}
