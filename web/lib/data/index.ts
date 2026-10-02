// ═══════════════════════════════════════════════════════════
// EAH — Data Layer (re-exports)
// ═══════════════════════════════════════════════════════════

export {
  getPublishedBusinesses,
  getFeaturedBusinesses,
  getNewBusinesses,
  getTrendingBusinesses,
  getActiveOffers,
  getNearbyBusinesses,
} from './businesses'
export type { Business, Offer } from './businesses'
