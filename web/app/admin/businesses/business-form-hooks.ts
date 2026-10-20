'use client'

import type { AdminBusiness } from '@/lib/data/admin-business'
import { useFormState } from './business-form-state'
import { useSaveHandlers } from './business-form-handlers'

// ═══════════════════════════════════════════════════════════
// EAH — Admin Business Form: Combined hook
// State in business-form-state.ts, handlers in business-form-handlers.ts.
// ═══════════════════════════════════════════════════════════

export function useBusinessFormState(business: AdminBusiness | null) {
  const state = useFormState(business)
  const handlers = useSaveHandlers(state, business)
  return { ...state, ...handlers }
}
