'use client'

import { useBusinessForm } from '../business-form-context'
import { SaveBar } from '../business-form-shared'
import styles from '../business-form.module.css'

export default function LocationSection() {
  const ctx = useBusinessForm()
  return (
    <form id="location-form" className={styles.sections}>
      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label className={styles.label}>Latitude</label>
          <input name="latitude" className={styles.input} dir="ltr" placeholder="30.123456" />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Longitude</label>
          <input name="longitude" className={styles.input} dir="ltr" placeholder="31.123456" />
        </div>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>العنوان التفصيلي</label>
        <input
          name="address_text"
          defaultValue={ctx.addressText}
          className={styles.input}
          dir="rtl"
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Google Maps URL</label>
        <input
          name="map_url"
          defaultValue={ctx.business.map_url ?? ''}
          className={styles.input}
          dir="ltr"
        />
      </div>
      <SaveBar
        onClick={ctx.saveLocation}
        pending={ctx.pending}
        saved={ctx.savedSection === 'location'}
      />
    </form>
  )
}
