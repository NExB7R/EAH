'use client'

import { useBusinessForm } from '../business-form-context'
import { SaveBar } from '../business-form-shared'
import styles from '../business-form.module.css'

export default function OwnerSection() {
  const ctx = useBusinessForm()
  return (
    <>
      {ctx.business.owner && (
        <div className={styles.field}>
          <span className={styles.label}>المالك الحالي</span>
          <span className={styles.hint}>
            {ctx.business.owner.display_name}{' '}
            {ctx.business.owner.phone ? `— ${ctx.business.owner.phone}` : ''}
          </span>
        </div>
      )}
      <div className={styles.field}>
        <label className={styles.label}>تغيير المالك</label>
        <input
          value={ctx.ownerId}
          onChange={(e) => ctx.setOwnerId(e.target.value)}
          className={styles.input}
          dir="ltr"
          placeholder="User ID"
        />
        <span className={styles.hint}>الصق معرّف المستخدم — لازم يكون في user_roles</span>
      </div>
      <SaveBar onClick={ctx.saveOwner} pending={ctx.pending} saved={ctx.savedSection === 'owner'} />
    </>
  )
}
