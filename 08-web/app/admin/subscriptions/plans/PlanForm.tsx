'use client'
import { useActionState } from 'react'
import { savePlanAction } from './actions'
import type { SubscriptionPlan } from '@/lib/subscription'

type State = { ok: boolean; error?: string; id?: string }

export default function PlanForm({ plan }: { plan?: SubscriptionPlan }) {
  const [state, action, pending] = useActionState<State, FormData>(
    async (_prev, fd) => savePlanAction(fd),
    { ok: false }
  )

  return (
    <form action={action} className="plan-form">
      {plan?.id && <input type="hidden" name="id" value={plan.id} />}
      <div className="plan-form__row">
        <label>الكود<input name="code" defaultValue={plan?.code ?? ''} required dir="ltr" placeholder="featured_monthly" /></label>
        <label>الاسم<input name="name_ar" defaultValue={plan?.name_ar ?? ''} required placeholder="مميز شهري" /></label>
      </div>
      <label className="plan-form__full">الوصف<textarea name="description" defaultValue={plan?.description ?? ''} rows={2} maxLength={300} /></label>
      <div className="plan-form__row plan-form__row--3">
        <label>المدة (يوم)<input type="number" name="duration_days" defaultValue={plan?.duration_days ?? 30} min={1} required /></label>
        <label>التجربة (يوم)<input type="number" name="trial_days" defaultValue={plan?.trial_days ?? 30} min={0} /></label>
        <label>السعر (اتركه فاضي = تواصل)<input type="number" step="0.01" name="price_egp" defaultValue={plan?.price_egp ?? ''} /></label>
      </div>
      <label className="plan-form__full">المميزات (comma-separated)<input name="features" defaultValue={(plan?.features ?? []).join(', ')} dir="ltr" placeholder="featured_badge, priority_ranking, one_ad" /></label>
      <div className="plan-form__row">
        <label>الترتيب<input type="number" name="display_order" defaultValue={plan?.display_order ?? 0} /></label>
        <label className="plan-form__check"><input type="checkbox" name="is_active" defaultChecked={plan?.is_active ?? true} /> نشطة</label>
      </div>
      {state.error && <p className="plan-form__error">⚠ {state.error}</p>}
      {state.ok && <p className="plan-form__ok">✅ تم الحفظ</p>}
      <button type="submit" disabled={pending} className="plan-form__btn">
        {pending ? '...' : plan ? '💾 حفظ' : '➕ إضافة'}
      </button>
    </form>
  )
}
