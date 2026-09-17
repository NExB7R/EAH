'use client'
import { useState } from 'react'

const PRESETS = [
  { value: 'restaurant', label: 'مطعم' },
  { value: 'pharmacy', label: 'صيدلية' },
  { value: 'supermarket', label: 'ماركت' },
  { value: 'delivery_office', label: 'مكتب توصيل' },
]

const EMOJI_OPTIONS = [
  '', '', '', '', '', '', '', '',
  '🥗', '', '', '✂️', '💈', '', '👕', '💻',
  '🔧', '🚗', '', '🧴', '🐾', '🌹', '', '',
]

export default function ApplyCategoryPicker() {
  const [selected, setSelected] = useState<string>('restaurant')
  const [customName, setCustomName] = useState('')
  const [customEmoji, setCustomEmoji] = useState('')

  const isOther = selected === 'other'

  return (
    <div className="ap-field">
      <label className="ap-label">نوع النشاط *</label>

      <div className="ap-categories">
        {PRESETS.map((c) => (
          <label key={c.value} className={`ap-cat ${selected === c.value ? 'is-selected' : ''}`}>
            <input
              type="radio"
              name="category"
              value={c.value}
              checked={selected === c.value}
              onChange={() => setSelected(c.value)}
            />
            <span className="ap-cat__inner">{c.label}</span>
          </label>
        ))}
        <label className={`ap-cat ap-cat--other ${isOther ? 'is-selected' : ''}`}>
          <input
            type="radio"
            name="category"
            value="other"
            checked={isOther}
            onChange={() => setSelected('other')}
          />
          <span className="ap-cat__inner">أخرى</span>
        </label>
      </div>

      {isOther && (
        <div className="ap-other">
          <p className="ap-other__hint">
            اكتب اسم المجال، واختار أيقونة تناسبك — الإدارة هتراجعها.
          </p>

          <div className="ap-other__preview">
            <span className="ap-other__preview-emoji">{customEmoji}</span>
            <span className="ap-other__preview-name">
              {customName.trim() || 'اسم المجال'}
            </span>
          </div>

          <div className="ap-field">
            <label htmlFor="custom_category" className="ap-label">
              اسم المجال المخصص *
            </label>
            <input
              id="custom_category"
              name="custom_category"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="مثلاً: كافيه، صالون حلاقة، مكتبة، نادي..."
              required={isOther}
              minLength={2}
              maxLength={50}
              className="ap-input"
            />
          </div>

          <div className="ap-field">
            <label className="ap-label">الأيقونة *</label>
            <input type="hidden" name="custom_emoji" value={customEmoji} />
            <div className="ap-emoji-grid">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  className={`ap-emoji-btn ${customEmoji === e ? 'is-active' : ''}`}
                  onClick={() => setCustomEmoji(e)}
                  aria-label={`اختيار ${e}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
