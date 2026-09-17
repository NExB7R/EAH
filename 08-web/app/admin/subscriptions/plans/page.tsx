import Link from 'next/link'
import { getAllPlans, formatDuration, formatPrice } from '@/lib/subscription'
import PlanForm from './PlanForm'
import './plans.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'إدارة الباقات' }

export default async function AdminPlansPage() {
  const plans = await getAllPlans()

  return (
    <>
      <div className="admin-header">
        <div className="admin-header__info">
          <span className="admin-header__kicker">باقات الاشتراك</span>
          <h1 className="admin-header__title">⚙️ إدارة الباقات</h1>
          <p className="admin-header__subtitle">
            {plans.length} باقة — عدّل الأسعار والمدة والمميزات
          </p>
        </div>
        <div className="admin-header__actions">
          <Link href="/admin/subscriptions" className="admin-btn admin-btn--ghost">
            ← الاشتراكات
          </Link>
        </div>
      </div>

      <div className="plans-grid">
        {plans.map((p) => (
          <article key={p.id} className={`plan-card ${p.is_active ? '' : 'is-inactive'}`}>
            <div className="plan-card__head">
              <h3>{p.name_ar}</h3>
              {!p.is_active && <span className="plan-card__off">معطّل</span>}
            </div>
            {p.description && <p className="plan-card__desc">{p.description}</p>}
            <div className="plan-card__meta">
              <span>⏱ {formatDuration(p.duration_days)}</span>
              <span>{p.trial_days} يوم تجريبي</span>
              <span>{formatPrice(p.price_egp)}</span>
            </div>
            {p.features?.length > 0 && (
              <div className="plan-card__features">
                {p.features.map((f: string) => (
                  <span key={f} className="plan-card__feat">✓ {f}</span>
                ))}
              </div>
            )}
            <details className="plan-card__edit">
              <summary>تعديل</summary>
              <PlanForm plan={p} />
            </details>
          </article>
        ))}
      </div>

      <div className="plans-new">
        <h2>إضافة باقة جديدة</h2>
        <PlanForm />
      </div>
    </>
  )
}
