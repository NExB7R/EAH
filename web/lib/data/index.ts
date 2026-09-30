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
  getTrendingBusinesses,
  getActiveOffers,
  getNearbyBusinesses,
  isOpenNow,
} from './businesses'
export type { Business, BusinessType, WorkingHours, WorkingDay, Offer } from './businesses'

export { AREAS } from './areas'
export type { Area } from './areas'
