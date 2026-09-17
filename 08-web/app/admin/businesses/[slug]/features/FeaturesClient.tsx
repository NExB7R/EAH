'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { FEATURES, FEATURE_CATEGORY_LABEL, type Feature, type FeatureKey } from '@/lib/features'

type Row = { feature_key: string; enabled: boolean; expires_at: string | null; notes: string | null }

export default function FeaturesClient({
  businessId, businessSlug, initialFeatures,
}: { businessId: string; businessSlug: string; initialFeatures: Row[] }) {
  const [state, setState] = useState<Map<string, Row>>(() => {
    const m = new Map<string, Row>()
    for (const f of initialFeatures) m.set(f.feature_key, f)
    return m
  })
  const [busy, setBusy] = useState<string | null>(null)
  const [expiresDays, setExpiresDays] = useState(30)

  async function toggle(key: FeatureKey, current: boolean) {
    setBusy(key)
    try {
      const supabase = createClient()
      const expiresAt = !current && expiresDays > 0
        ? new Date(Date.now() + expiresDays * 86400_000).toISOString()
        : null
      const { data } = await supabase.rpc('set_business_feature', {
        p_business_id: businessId,
        p_feature: key,
        p_enabled: !current,
        p_expires_at: expiresAt,
        p_notes: null,
      })
      if (data?.ok) {
        setState((prev) => {
          const m = new Map(prev)
          m.set(key, { feature_key: key, enabled: !current, expires_at: expiresAt, notes: null })
          return m
        })
      }
    } catch {}
    setBusy(null)
  }

  const byCategory: Record<string, Feature[]> = {}
  for (const f of FEATURES) {
    byCategory[f.category] = byCategory[f.category] ?? []
    byCategory[f.category].push(f)
  }

  const activeCount = Array.from(state.values()).filter((r) => r.enabled).length

  return (
    <div className="bf__body">
      <section className="bf__summary">
        <span className="bf__summary-num">{activeCount} / {FEATURES.length}</span>
        <span className="bf__summary-label">ميزات مفعّلة</span>
      </section>

      <section className="bf__expires">
        <label>
          <span>مدة التفعيل (يوم)</span>
          <input
            type="number" min={1} max={365} value={expiresDays}
            onChange={(e) => setExpiresDays(Number(e.target.value))}
          />
        </label>
        <small>عند تفعيل أي ميزة، هتشتغل للمدة دي وبعدها تتوقف تلقائي</small>
      </section>

      {Object.entries(byCategory).map(([cat, list]) => (
        <section key={cat} className="bf__group">
          <h2 className="bf__group-title">{FEATURE_CATEGORY_LABEL[cat] ?? cat}</h2>
          <div className="bf__list">
            {list.map((f) => {
              const row = state.get(f.key)
              const enabled = row?.enabled ?? false
              return (
                <article key={f.key} className={`bf__item ${enabled ? 'is-on' : ''}`}>
                  <span className="bf__item-emoji">{f.emoji}</span>
                  <div className="bf__item-body">
                    <strong className="bf__item-label">{f.label}</strong>
                    <span className="bf__item-desc">{f.desc}</span>
                    {enabled && row?.expires_at && (
                      <span className="bf__item-exp">
                        ينتهي: {new Date(row.expires_at).toLocaleDateString('ar-EG')}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className={`bf__switch ${enabled ? 'is-on' : ''}`}
                    disabled={busy === f.key}
                    onClick={() => toggle(f.key, enabled)}
                    aria-label={enabled ? 'إيقاف' : 'تشغيل'}
                  >
                    <span className="bf__switch-knob" />
                  </button>
                </article>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
