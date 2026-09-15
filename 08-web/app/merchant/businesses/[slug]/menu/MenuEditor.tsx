'use client'
import { useState, useTransition } from 'react'
import './menu.css'

type Item = {
  id?: string
  business_id: string
  category: string
  name: string
  description: string | null
  price: number | null
  image_url: string | null
  is_available: boolean
  sort_order: number
}

const EMPTY: Item = {
  business_id: '',
  category: 'عام',
  name: '',
  description: null,
  price: null,
  image_url: null,
  is_available: true,
  sort_order: 0,
}

export default function MenuEditor({
  businessId,
  initialItems,
}: {
  businessId: string
  initialItems: Item[]
}) {
  const [items, setItems] = useState<Item[]>(initialItems)
  const [editing, setEditing] = useState<Item | null>(null)
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)

  function openNew() {
    const nextOrder = items.length
    setEditing({ ...EMPTY, business_id: businessId, sort_order: nextOrder })
  }

  function openEdit(item: Item) {
    setEditing({ ...item })
  }

  async function save() {
    if (!editing) return
    if (!editing.name.trim()) { setMsg('⚠ اكتب الاسم'); return }

    start(async () => {
      try {
        const res = await fetch('/api/merchant/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editing.id,
            business_id: businessId,
            category: editing.category,
            name: editing.name.trim(),
            description: editing.description || null,
            price: editing.price,
            image_url: editing.image_url || null,
            is_available: editing.is_available,
            sort_order: editing.sort_order,
          }),
        })
        const data = await res.json()
        if (!res.ok || !data.ok) { setMsg('⚠ ' + (data.error || 'فشل')); return }

        // Refresh
        const listRes = await fetch('/api/merchant/menu?business=' + businessId)
        const listData = await listRes.json()
        if (listData.ok) setItems(listData.items)
        setEditing(null)
        setMsg('✅ تم الحفظ')
        setTimeout(() => setMsg(null), 2000)
      } catch (e: any) {
        setMsg('⚠ ' + e.message)
      }
    })
  }

  async function remove(id: string) {
    if (!confirm('تحذف الصنف؟')) return
    start(async () => {
      try {
        const res = await fetch(
          '/api/merchant/menu?id=' + id + '&business=' + businessId,
          { method: 'DELETE' }
        )
        const data = await res.json()
        if (!res.ok || !data.ok) { setMsg('⚠ ' + (data.error || 'فشل')); return }
        setItems(items.filter((i) => i.id !== id))
        setMsg('✅ تم الحذف')
        setTimeout(() => setMsg(null), 2000)
      } catch (e: any) {
        setMsg('⚠ ' + e.message)
      }
    })
  }

  async function toggleAvailability(item: Item) {
    if (!item.id) return
    start(async () => {
      await fetch('/api/merchant/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, is_available: !item.is_available }),
      })
      setItems(items.map((i) => (i.id === item.id ? { ...i, is_available: !i.is_available } : i)))
    })
  }

  // Group by category
  const grouped = items.reduce((acc: Record<string, Item[]>, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  return (
    <div className="me">
      {msg && <div className="me__toast">{msg}</div>}

      <div className="me__actions">
        <button type="button" className="me__add" onClick={openNew} disabled={pending}>
          ➕ إضافة صنف
        </button>
        <span className="me__count">{items.length} صنف</span>
      </div>

      {items.length === 0 ? (
        <div className="me__empty">
          <span className="me__empty-emoji">📋</span>
          <h2 className="me__empty-title">لسه مفيش أصناف</h2>
          <p className="me__empty-text">
            اضغط "إضافة صنف" وأضف أول عنصر في المنيو
          </p>
        </div>
      ) : (
        <div className="me__categories">
          {Object.entries(grouped).map(([cat, list]) => (
            <section key={cat} className="me__cat">
              <h2 className="me__cat-title">
                {cat}
                <span className="me__cat-count">{list.length}</span>
              </h2>
              <div className="me__list">
                {list.map((item) => (
                  <article key={item.id} className={`me__item ${!item.is_available ? 'is-off' : ''}`}>
                    {item.image_url && (
                      <div className="me__img">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image_url} alt={item.name} />
                      </div>
                    )}
                    <div className="me__info">
                      <strong className="me__name">{item.name}</strong>
                      {item.description && <p className="me__desc">{item.description}</p>}
                      {item.price != null && <span className="me__price">{item.price} ج.م</span>}
                    </div>
                    <div className="me__item-actions">
                      <button type="button" className="me__btn" onClick={() => toggleAvailability(item)}>
                        {item.is_available ? '👁' : '🚫'}
                      </button>
                      <button type="button" className="me__btn" onClick={() => openEdit(item)}>✏️</button>
                      <button type="button" className="me__btn me__btn--danger" onClick={() => item.id && remove(item.id)}>🗑</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {editing && (
        <div className="me__modal-overlay" onClick={() => setEditing(null)}>
          <div className="me__modal" onClick={(e) => e.stopPropagation()}>
            <header className="me__modal-head">
              <h3>{editing.id ? '✏️ تعديل صنف' : '➕ صنف جديد'}</h3>
              <button type="button" className="me__modal-close" onClick={() => setEditing(null)}>×</button>
            </header>

            <div className="me__modal-body">
              <label className="me__field">
                <span>الاسم *</span>
                <input
                  type="text"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  placeholder="مثلاً: شاورما فراخ"
                />
              </label>

              <label className="me__field">
                <span>الفئة</span>
                <input
                  type="text"
                  value={editing.category}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  placeholder="مثلاً: ساندويتشات / مشروبات"
                />
              </label>

              <label className="me__field">
                <span>الوصف</span>
                <textarea
                  value={editing.description ?? ''}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  rows={3}
                  placeholder="وصف قصير للطبق..."
                />
              </label>

              <label className="me__field">
                <span>السعر (ج.م)</span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={editing.price ?? ''}
                  onChange={(e) => setEditing({ ...editing, price: e.target.value ? Number(e.target.value) : null })}
                  placeholder="0.00"
                />
              </label>

              <label className="me__field">
                <span>رابط الصورة</span>
                <input
                  type="url"
                  dir="ltr"
                  value={editing.image_url ?? ''}
                  onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </label>

              <label className="me__check">
                <input
                  type="checkbox"
                  checked={editing.is_available}
                  onChange={(e) => setEditing({ ...editing, is_available: e.target.checked })}
                />
                <span>متاح للطلب</span>
              </label>
            </div>

            <footer className="me__modal-foot">
              <button type="button" className="me__btn-save" onClick={save} disabled={pending}>
                {pending ? '...' : '💾 حفظ'}
              </button>
              <button type="button" className="me__btn-cancel" onClick={() => setEditing(null)}>
                إلغاء
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  )
}
