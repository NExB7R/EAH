'use client'

import { PrinterIcon } from '@/components/icons'
import styles from './insight.module.css'

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={styles.printBtn}
    >
      <PrinterIcon size={16} />
      <span>طبع / PDF</span>
    </button>
  )
}
