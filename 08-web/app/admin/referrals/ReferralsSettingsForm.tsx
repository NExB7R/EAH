'use client'
import { useState, useTransition } from 'react'

type Settings = {
  referrer_bonus: number
  referred_bonus: number
  min_days_between: number
  max_referrals_per_user: number | null
  require_verification: boolean
  is_active: boolean
}

export default function ReferralsSettingsForm({
  initial,
  action,
}: {
  initial: Settings
  action: (fd: FormData) => Promise<{ ok: boolean }>
}) {
  const [saved, setSaved] = useState(false)
  const [pending, start] = useTransition()

  function submit(fd: FormData) {
    start(async () => {
      await action(fd)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    })
  }

  return (
    <form action={submit} className="ref-form">
      <div className="ref-form__row">
        <label>
          <span>مكافأة الداعي</span>
          <input
            type="number"
            name="referrer_bonus"
            defaultValue={initial.referrer_bonus}
            min={0}
            required
          />
          <small>النقاط اللي بتوصل للشخص اللي دعا</small>
        </label>
        <label>
          <span>مكافأة المدعو</span>
          <input
            type="number"
            name="referred_bonus"
            defaultValue={initial.referred_bonus}
            min={0}
            required
          />
          <small>النقاط اللي بتوصل للشخص الجديد</small>
        </label>
      </div>

      <div className="ref-form__row">
        <label>
          <span>الحد الأقصى للإحالات لكل مستخدم</span>
          <input
            type="number"
            name="max_referrals_per_user"
            defaultValue={initial.max_referrals_per_user ?? ''}
            placeholder="اتركه فاضي = بدون حد"
            min={0}
          />
        </label>
        <label>
          <span>أدنى فاصل بين الإحالات (أيام)</span>
          <input
            type="number"
            name="min_days_between"
            defaultValue={initial.min_days_between}
            min={0}
          />
        </label>
      </div>

      <div className="ref-form__checks">
        <label className="ref-check">
          <input
            type="checkbox"
            name="require_verification"
            defaultChecked={initial.require_verification}
          />
          <span>يتطلب توثيق الحساب</span>
        </label>
        <label className="ref-check">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={initial.is_active}
          />
          <span>النظام مفعّل</span>
        </label>
      </div>

      <button type="submit" className="ref-save" disabled={pending}>
        {pending ? '...' : saved ? '✅ اتحفظ' : 'حفظ الإعدادات'}
      </button>
    </form>
  )
}
