'use client'
import { useActionState, useState, useTransition } from 'react'
import { addBranch, updateBranch, deleteBranch, setPrimary, toggleBranchActive } from '@/app/admin/businesses/[slug]/branches/actions'
import './branches-editor.css'

export type Branch = {
  id: string
  name: string
  area: string
  address_text: string | null
  latitude: number | null
  longitude: number | null
  phone: string | null
  whatsapp: string | null
  is_primary: boolean
  is_active: boolean
  sort_order: number
}

const AREAS = [
  'شبين القناطر', 'القلج', 'أبو زعبل', 'الجبل الأصفر',
  'الحصافة', 'الزهويين', 'الشوبك', 'كفر الشوبك',
  'الأحراز', 'تل بني تميم', 'طحا', 'كفر طحا',
  'نوى', 'منشأة الكرام', 'أخرى',
]

function BranchForm({
  mode, businessId, initial, onDone,
}: {
  mode: 'add' | 'edit'
  businessId: string
  initial?: Branch
  onDone: () => void
}) {
  const action = mode === 'add' ? addBranch : updateBranch
  const [state, formAction, pending] = useActionState(action, { ok: false })

  // لو نجح → اقفل
  if (state.ok) {
    setTimeout(onDone, 500)
  }

  return (
    <form action={formAction} className="brf">
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="business_id" value={businessId} />

      <div className="brf__grid">
        <label className="brf__field brf__field--full">
          <span className="brf__label">اسم الفرع *</span>
          <input
            name="name"
            className="brf__input"
            defaultValue={initial?.name ?? ''}
            placeholder="مثلاً: فرع المعادي"
            required
            maxLength={100}
          />
        </label>

        <label className="brf__field">
          <span className="brf__label">المنطقة *</span>
          <select name="area" className="brf__input" defaultValue={initial?.area ?? 'شبين القناطر'} required>
            {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>

        <label className="brf__field">
          <span className="brf__label">الموبايل</span>
          <input
            name="phone"
            className="brf__input"
            dir="ltr"
            defaultValue={initial?.phone ?? ''}
            placeholder="01012345678"
            maxLength={30}
          />
        </label>

        <label className="brf__field">
          <span className="brf__label">واتساب</span>
          <input
            name="whatsapp"
            className="brf__input"
            dir="ltr"
            defaultValue={initial?.whatsapp ?? ''}
            placeholder="201012345678"
            maxLength={30}
          />
        </label>

        <label className="brf__field brf__field--full">
          <span className="brf__label">العنوان بالتفصيل</span>
          <input
            name="address_text"
            className="brf__input"
            defaultValue={initial?.address_text ?? ''}
            placeholder="شارع الجمهورية، أمام البنك"
            maxLength={200}
          />
        </label>

        <label className="brf__field">
          <span className="brf__label">Latitude</span>
          <input
            name="latitude"
            className="brf__input"
            dir="ltr"
            type="number"
            step="any"
            defaultValue={initial?.latitude ?? ''}
            placeholder="30.3144"
          />
        </label>

        <label className="brf__field">
          <span className="brf__label">Longitude</span>
          <input
            name="longitude"
            className="brf__input"
            dir="ltr"
            type="number"
            step="any"
            defaultValue={initial?.longitude ?? ''}
            placeholder="31.3212"
          />
        </label>

        <label className="brf__check">
          <input
            type="checkbox"
            name="is_primary"
            defaultChecked={initial?.is_primary ?? false}
          />
          <span>الفرع الرئيسي</span>
        </label>

        {initial && (
          <label className="brf__check">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={initial.is_active}
            />
            <span>نشط (يظهر للناس)</span>
          </label>
        )}
      </div>

      {state.message && !state.ok && (
        <div className="brf__error">{state.message}</div>
      )}

      <div className="brf__actions">
        <button type="button" className="brf__btn brf__btn--ghost" onClick={onDone}>
          إلغاء
        </button>
        <button type="submit" className="brf__btn brf__btn--primary" disabled={pending}>
          {pending ? '...' : mode === 'add' ? 'أضف الفرع' : 'حفظ'}
        </button>
      </div>
    </form>
  )
}

export default function BranchesEditor({
  businessId,
  branches,
}: {
  businessId: string
  branches: Branch[]
}) {
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [pending, start] = useTransition()

  return (
    <div className="bre">
      <header className="bre__head">
        <div>
          <span className="bre__kicker">إدارة الفروع</span>
          <h2 className="bre__title">الفروع</h2>
          <p className="bre__sub">
            {branches.length === 0
              ? 'لسه مفيش فروع — ضيف أول فرع'
              : `${branches.length} فرع`}
          </p>
        </div>
        {!adding && (
          <button type="button" className="bre__add-btn" onClick={() => setAdding(true)}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            ضيف فرع
          </button>
        )}
      </header>

      {adding && (
        <div className="bre__form-wrap">
          <BranchForm mode="add" businessId={businessId} onDone={() => setAdding(false)} />
        </div>
      )}

      {branches.length === 0 && !adding && (
        <div className="bre__empty">
          <div className="bre__empty-icon">🏪</div>
          <h3 className="bre__empty-title">لسه مفيش فروع</h3>
          <p className="bre__empty-msg">ضيف فرعك الأول — هيظهر في صفحة النشاط مع خريطة منفصلة</p>
          <button type="button" className="bre__empty-btn" onClick={() => setAdding(true)}>
            ضيف أول فرع
          </button>
        </div>
      )}

      {branches.length > 0 && (
        <div className="bre__list">
          {branches.map((b) => (
            <div key={b.id} className={`bre__card ${b.is_primary ? 'is-primary' : ''} ${!b.is_active ? 'is-hidden' : ''}`}>
              {editingId === b.id ? (
                <BranchForm
                  mode="edit"
                  businessId={businessId}
                  initial={b}
                  onDone={() => setEditingId(null)}
                />
              ) : (
                <>
                  <div className="bre__card-head">
                    <div className="bre__card-title-wrap">
                      {b.is_primary && <span className="bre__crown">👑</span>}
                      <h3 className="bre__card-title">{b.name}</h3>
                      {!b.is_active && <span className="bre__hidden-badge">مخفي</span>}
                    </div>
                    <div className="bre__card-actions">
                      {!b.is_primary && b.is_active && (
                        <button
                          type="button"
                          className="bre__action-btn"
                          onClick={() => start(async () => { await setPrimary(b.id, businessId) })}
                          disabled={pending}
                          title="اجعله رئيسي"
                        >
                          اجعله رئيسي
                        </button>
                      )}
                      <button
                        type="button"
                        className="bre__action-btn"
                        onClick={() => setEditingId(b.id)}
                        title="تعديل"
                      >
                        تعديل
                      </button>
                      <button
                        type="button"
                        className="bre__action-btn"
                        onClick={() => start(async () => { await toggleBranchActive(b.id, businessId, b.is_active) })}
                        disabled={pending}
                        title={b.is_active ? 'إخفاء' : 'إظهار'}
                      >
                        {b.is_active ? 'إخفاء' : 'إظهار'}
                      </button>
                      <button
                        type="button"
                        className="bre__action-btn bre__action-btn--danger"
                        onClick={() => {
                          if (!confirm(`متأكد تحذف "${b.name}"؟`)) return
                          start(async () => { await deleteBranch(b.id, businessId) })
                        }}
                        disabled={pending}
                        title="حذف"
                      >
                        حذف
                      </button>
                    </div>
                  </div>

                  <div className="bre__card-body">
                    <span className="bre__meta">
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {b.area}
                    </span>
                    {b.address_text && (
                      <span className="bre__meta">{b.address_text}</span>
                    )}
                    {b.phone && (
                      <span className="bre__meta bre__meta--phone" dir="ltr">{b.phone}</span>
                    )}
                    {b.whatsapp && (
                      <span className="bre__meta bre__meta--wa" dir="ltr">WA: {b.whatsapp}</span>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
