// ═══════════════════════════════════════════════════════════
// EAH — Data Layer (re-exports)
// ═══════════════════════════════════════════════════════════

export { getUserSession } from './user'
export type { UserSession, AppRole } from './user'

export {
  getPublishedBusinesses,
  getFeaturedBusinesses,
  getNewBusinesses,
  getBusinessesByType,
  getBusinessBySlug,
  getTopBusinesses,
  getOpportunities,
  getTrendingBusinesses,
  isOpenNow,
} from './businesses'
export type { Business, BusinessType, WorkingHours, WorkingDay } from './businesses'

export {
  AREAS,
  DEFAULT_AREA,
  AREA_COORDS,
} from './areas'
export type { Area } from './areas'
