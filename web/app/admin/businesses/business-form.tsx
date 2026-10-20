'use client'

import type { Props } from './business-form-config'
import CreateForm from './create-form'
import EditForm from './edit-form'

// ═══════════════════════════════════════════════════════════
// EAH — Admin Business Form (dispatcher)
// Split for GOD-01 (2026-10-20): main logic in edit-form / create-form,
// state in business-form-hooks, sections in ./sections/*.
// ═══════════════════════════════════════════════════════════

export default function BusinessForm(props: Props) {
  if (props.mode === 'create') {
    return <CreateForm owners={props.owners} />
  }
  return <EditForm business={props.business} />
}
