'use client'

import { CloseIcon, PlusIcon } from '@/components/icons'
import { useBusinessForm } from '../business-form-context'
import { SaveBar } from '../business-form-shared'
import styles from '../business-form.module.css'

export default function BranchesSection() {
  const ctx = useBusinessForm()
  return (
    <>
      {ctx.branches.length === 0 && (
        <p className={styles.hint}>مفيش فروع — الفرع الأساسي في قسم الموقع</p>
      )}
      <div className={styles.branchesList}>
        {ctx.branches.map((br, idx) => (
          <div key={br.id ?? `new-${idx}`} className={styles.branchCard}>
            <div className={styles.branchHead}>
              <span className={styles.branchName}>{br.name || `فرع ${idx + 1}`}</span>
              <div className={styles.branchActions}>
                <button
                  type="button"
                  className={`${styles.branchIconBtn} ${styles.branchDelete}`}
                  onClick={() => ctx.removeBranch(idx)}
                  aria-label="حذف"
                >
                  <CloseIcon size={14} />
                </button>
              </div>
            </div>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>اسم الفرع</label>
                <input
                  value={br.name}
                  onChange={(e) => ctx.updateBranch(idx, 'name', e.target.value)}
                  className={styles.input}
                  dir="rtl"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>المنطقة</label>
                <input
                  value={br.area}
                  onChange={(e) => ctx.updateBranch(idx, 'area', e.target.value)}
                  className={styles.input}
                  dir="rtl"
                />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>العنوان</label>
              <input
                value={br.address_text}
                onChange={(e) => ctx.updateBranch(idx, 'address_text', e.target.value)}
                className={styles.input}
                dir="rtl"
              />
            </div>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>هاتف</label>
                <input
                  value={br.phone}
                  onChange={(e) => ctx.updateBranch(idx, 'phone', e.target.value)}
                  className={styles.input}
                  dir="ltr"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>واتساب</label>
                <input
                  value={br.whatsapp}
                  onChange={(e) => ctx.updateBranch(idx, 'whatsapp', e.target.value)}
                  className={styles.input}
                  dir="ltr"
                />
              </div>
            </div>
            <div className={styles.checkRow}>
              <input
                type="checkbox"
                id={`br-primary-${idx}`}
                checked={br.is_primary}
                disabled={!br.is_active}
                onChange={(e) => ctx.updateBranch(idx, 'is_primary', e.target.checked)}
              />
              <label htmlFor={`br-primary-${idx}`}>الفرع الرئيسي</label>
            </div>
            <div className={styles.checkRow}>
              <input
                type="checkbox"
                id={`br-active-${idx}`}
                checked={br.is_active}
                onChange={(e) => {
                  const active = e.target.checked
                  ctx.updateBranch(idx, 'is_active', active)
                  if (!active && br.is_primary) ctx.updateBranch(idx, 'is_primary', false)
                }}
              />
              <label htmlFor={`br-active-${idx}`}>فرع نشط على المنصة</label>
            </div>
            <SaveBar
              onClick={() => ctx.saveBranch(idx)}
              pending={ctx.pending}
              saved={false}
              label="حفظ الفرع"
            />
          </div>
        ))}
      </div>
      <button type="button" className={styles.addBtn} onClick={ctx.addBranch}>
        <PlusIcon size={14} /> إضافة فرع
      </button>
    </>
  )
}
