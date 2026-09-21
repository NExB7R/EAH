'use client'
import { useState, useTransition, useActionState } from 'react'
import {
  invitePartnerAction,
  removePartnerAction,
  updatePartnerRoleAction,
} from '@/app/merchant/businesses/[slug]/partners/actions'
import './partners-editor.css'

export type Partner = {
  id: string
  profile_id: string
  role: 'owner' | 'manager' | 'editor' | 'viewer'
  status: 'pending' | 'accepted' | 'rejected' | 'revoked'
  invited_at: string
  accepted_at: string | null
  notes: string | null
  profile: {
    display_name: string
    phone: string | null
    avatar_url: string | null
    avatar_key: string | null
    verified_at: string | null
  } | null
}

const ROLE_META = {
  owner:   { label: 'صاحب النشاط', emoji: '👑', color: 'gold',     desc: 'كل حاجة — مايتشالش' },
  manager: { label: 'مدير',        emoji: '⭐', color: 'purple',   desc: 'يدير كل حاجة إلا الشركاء' },
  editor:  { label: 'محرر',        emoji: '📝', color: 'blue',     desc: 'يعدل + يرفع صور' },
  viewer:  { label: 'مشاهد',       emoji: '👁️', color: 'gray',     desc: 'يشوف التقارير بس' },
} as const

const STATUS_META = {
  pending:  { label: 'دعوة معلقة', color: 'warning' },
  accepted: { label: 'شريك نشط',   color: 'success' },
  rejected: { label: 'مرفوضة',     color: 'danger' },
  revoked:  { label: 'ملغي',       color: 'gray' },
} as const

function Initials({ name }: { name: string }) {
  const initial = (name?.trim().charAt(0) || '؟').toUpperCase()
  return <span className="pe__avatar-initial">{initial}</span>
}

function InviteForm({
  businessId,
  onDone,
}: {
  businessId: string
  onDone: () => void
}) {
  const [state, formAction, pending] = useActionState(invitePartnerAction, { ok: false })

  if (state.ok) {
    setTimeout(onDone, 800)
  }

  return (
    <form action={formAction} className="pe__invite-form">
      <input type="hidden" name="business_id" value={businessId} />

      <div className="pe__invite-header">
        <div className="pe__invite-icon">🪄</div>
        <div>
          <h3 className="pe__invite-title">ادعي شريك</h3>
          <p className="pe__invite-sub">ابعت دعوة لأي حد — هيوصله إشعار وميقدرش يشتغل على النشاط غير لما يقبل</p>
        </div>
      </div>

      <div className="pe__invite-grid">
        <label className="pe__field">
          <span className="pe__label">رقم الموبايل *</span>
          <input
            name="phone"
            className="pe__input"
            dir="ltr"
            placeholder="01012345678"
            required
            maxLength={20}
          />
          <span className="pe__hint">لازم يكون مسجّل في EAH</span>
        </label>

        <label className="pe__field">
          <span className="pe__label">الدور *</span>
          <select name="role" className="pe__input" defaultValue="editor" required>
            <option value="manager">⭐ مدير — يعدّل + أوردرات + تقارير</option>
            <option value="editor">📝 محرر — يعدّل + يرفع صور</option>
            <option value="viewer">👁️ مشاهد — يشوف بس</option>
          </select>
        </label>

        <label className="pe__field pe__field--full">
          <span className="pe__label">ملاحظة (اختياري)</span>
          <input
            name="notes"
            className="pe__input"
            placeholder="مثلاً: شريك في الفرع الجديد"
            maxLength={200}
          />
        </label>
      </div>

      {state.message && !state.ok && (
        <div className="pe__error">{state.message}</div>
      )}
      {state.ok && state.message && (
        <div className="pe__success">{state.message}</div>
      )}

      <div className="pe__invite-actions">
        <button type="button" className="pe__btn pe__btn--ghost" onClick={onDone}>
          إلغاء
        </button>
        <button type="submit" className="pe__btn pe__btn--primary" disabled={pending}>
          {pending ? 'جاري الإرسال...' : '🪄 ابعت الدعوة'}
        </button>
      </div>
    </form>
  )
}

export default function PartnersEditor({
  businessId,
  businessName,
  partners,
  isOwner,
}: {
  businessId: string
  businessName: string
  partners: Partner[]
  isOwner: boolean
}) {
  const [inviting, setInviting] = useState(false)
  const [pending, start] = useTransition()
  const [changingRole, setChangingRole] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  function handleRemove(partner: Partner) {
    if (!confirm(`متأكد تشيل "${partner.profile?.display_name ?? 'الشريك'}"؟ مش هيقدر يشتغل على النشاط تاني`)) return
    start(async () => {
      const res = await removePartnerAction(partner.id)
      if (!res.ok) setErrorMsg(res.message ?? 'خطأ')
    })
  }

  function handleRoleChange(partner: Partner, newRole: string) {
    setChangingRole(null)
    start(async () => {
      const res = await updatePartnerRoleAction(partner.id, newRole)
      if (!res.ok) setErrorMsg(res.message ?? 'خطأ')
    })
  }

  const activePartners = partners.filter((p) => p.status === 'accepted')
  const pendingInvites = partners.filter((p) => p.status === 'pending')
  const pastPartners = partners.filter((p) => p.status === 'rejected' || p.status === 'revoked')

  return (
    <div className="pe">
      {/* ═══ HEADER ═══ */}
      <header className="pe__header">
        <div className="pe__header-glow" aria-hidden />
        <div className="pe__header-content">
          <span className="pe__kicker">
            <span className="pe__kicker-icon">🪄</span>
            المصباح السحري
          </span>
          <h1 className="pe__title">شركاء {businessName}</h1>
          <p className="pe__sub">
            أدِر فريقك بالكامل — كل شريك بحسابه وبدوره.
          </p>
        </div>
        {isOwner && !inviting && (
          <button type="button" className="pe__invite-btn" onClick={() => setInviting(true)}>
            <span>🪄</span>
            ادعي شريك
          </button>
        )}
      </header>

      {errorMsg && (
        <div className="pe__alert pe__alert--error">
          {errorMsg}
          <button type="button" onClick={() => setErrorMsg(null)} className="pe__alert-close">×</button>
        </div>
      )}

      {!isOwner && (
        <div className="pe__alert pe__alert--info">
          👁️ إنت بتشوف الشركاء — الإدارة الكاملة لصاحب النشاط بس
        </div>
      )}

      {inviting && isOwner && (
        <InviteForm businessId={businessId} onDone={() => setInviting(false)} />
      )}

      {/* ═══ ACTIVE PARTNERS ═══ */}
      <section className="pe__section">
        <h2 className="pe__section-title">
          <span className="pe__section-icon">⭐</span>
          الشركاء النشطين
          <span className="pe__section-count">{activePartners.length}</span>
        </h2>

        {activePartners.length === 0 ? (
          <div className="pe__empty-mini">
            <p>مفيش شركاء لسه — {isOwner ? 'ضيف أول واحد' : 'لما صاحب النشاط يدعي حد هيظهر هنا'}</p>
          </div>
        ) : (
          <div className="pe__grid">
            {activePartners.map((p) => {
              const role = ROLE_META[p.role]
              const isChanging = changingRole === p.id
              return (
                <article key={p.id} className={`pe__card pe__card--${role.color}`}>
                  <div className="pe__card-head">
                    <div className="pe__avatar">
                      {p.profile?.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.profile.avatar_url} alt={p.profile.display_name} />
                      ) : (
                        <Initials name={p.profile?.display_name ?? '؟'} />
                      )}
                    </div>
                    <div className="pe__card-info">
                      <h3 className="pe__card-name">
                        {p.profile?.display_name ?? 'شريك'}
                        {p.profile?.verified_at && <span className="pe__verified">✓</span>}
                      </h3>
                      {p.profile?.phone && (
                        <span className="pe__card-phone" dir="ltr">{p.profile.phone}</span>
                      )}
                    </div>
                    <span className={`pe__role-badge pe__role-badge--${role.color}`}>
                      {role.emoji} {role.label}
                    </span>
                  </div>

                  <p className="pe__card-role-desc">{role.desc}</p>

                  {p.notes && <p className="pe__card-notes">📝 {p.notes}</p>}

                  <div className="pe__card-meta">
                    <span className="pe__card-meta-item">
                      ✓ مقبول {p.accepted_at ? new Date(p.accepted_at).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' }) : '—'}
                    </span>
                  </div>

                  {/* Actions للمالك بس — ومش للـ owner */}
                  {isOwner && p.role !== 'owner' && (
                    <div className="pe__card-actions">
                      {isChanging ? (
                        <div className="pe__role-picker">
                          <button type="button" onClick={() => handleRoleChange(p, 'manager')} className="pe__role-opt">⭐ مدير</button>
                          <button type="button" onClick={() => handleRoleChange(p, 'editor')} className="pe__role-opt">📝 محرر</button>
                          <button type="button" onClick={() => handleRoleChange(p, 'viewer')} className="pe__role-opt">👁️ مشاهد</button>
                          <button type="button" onClick={() => setChangingRole(null)} className="pe__role-cancel">×</button>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="pe__action-btn"
                            onClick={() => setChangingRole(p.id)}
                            disabled={pending}
                          >
                            🔄 غيّر الدور
                          </button>
                          <button
                            type="button"
                            className="pe__action-btn pe__action-btn--danger"
                            onClick={() => handleRemove(p)}
                            disabled={pending}
                          >
                            ✕ شيل
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </section>

      {/* ═══ PENDING ═══ */}
      {pendingInvites.length > 0 && (
        <section className="pe__section">
          <h2 className="pe__section-title">
            <span className="pe__section-icon">⏳</span>
            دعوات معلقة
            <span className="pe__section-count pe__section-count--pending">{pendingInvites.length}</span>
          </h2>
          <div className="pe__grid">
            {pendingInvites.map((p) => {
              const role = ROLE_META[p.role]
              return (
                <article key={p.id} className={`pe__card pe__card--pending pe__card--${role.color}`}>
                  <div className="pe__card-head">
                    <div className="pe__avatar pe__avatar--pending">
                      <Initials name={p.profile?.display_name ?? '؟'} />
                    </div>
                    <div className="pe__card-info">
                      <h3 className="pe__card-name">{p.profile?.display_name ?? 'شريك'}</h3>
                      {p.profile?.phone && (
                        <span className="pe__card-phone" dir="ltr">{p.profile.phone}</span>
                      )}
                    </div>
                    <span className="pe__status-badge pe__status-badge--warning">
                      ⏳ معلقة
                    </span>
                  </div>
                  <p className="pe__card-role-desc">
                    {role.emoji} {role.label}
                  </p>
                  <p className="pe__card-meta-item">
                    بعتت {new Date(p.invited_at).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
                  </p>
                  {isOwner && (
                    <div className="pe__card-actions">
                      <button
                        type="button"
                        className="pe__action-btn pe__action-btn--danger"
                        onClick={() => handleRemove(p)}
                        disabled={pending}
                      >
                        ✕ الغي الدعوة
                      </button>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        </section>
      )}

      {/* ═══ PAST ═══ */}
      {pastPartners.length > 0 && (
        <details className="pe__past">
          <summary className="pe__past-summary">
            📜 سجل سابق ({pastPartners.length})
          </summary>
          <div className="pe__past-list">
            {pastPartners.map((p) => {
              const status = STATUS_META[p.status]
              return (
                <div key={p.id} className="pe__past-item">
                  <span className="pe__past-name">{p.profile?.display_name ?? 'شريك'}</span>
                  <span className={`pe__status-badge pe__status-badge--${status.color}`}>
                    {status.label}
                  </span>
                </div>
              )
            })}
          </div>
        </details>
      )}
    </div>
  )
}
