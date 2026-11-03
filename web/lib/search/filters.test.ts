import { describe, expect, it } from 'vitest'
import type { Business } from '@/lib/data/businesses'
import { applyFilters, DEFAULT_FILTERS, parseFilters, resolveResultSort } from './filters'

function makeBusiness(overrides: Partial<Business> = {}): Business {
  return {
    id: 'b1',
    slug: 'b1',
    name: 'Test',
    business_type: 'restaurant',
    subcategory: null,
    description: null,
    hook: null,
    area: 'شبين القناطر',
    city: 'القليوبية',
    address_text: null,
    map_url: null,
    cover_image_url: null,
    logo_url: null,
    is_open: true,
    is_featured: false,
    is_verified: false,
    verified_at: null,
    is_new_project: false,
    is_opportunity: false,
    opportunity_until: null,
    opportunity_note: null,
    velocity_score: 0,
    engagement_score: 0,
    diversity_score: 0,
    successful_orders: 0,
    featured_order: 0,
    featured_until: null,
    featured_pin: false,
    new_until: null,
    working_hours: null,
    accepts_whatsapp_orders: false,
    accepts_orders: false,
    orders_enabled: false,
    response_time_avg_seconds: null,
    response_rate: null,
    last_activity_at: null,
    branches_count: 0,
    offers_count: 0,
    rating_avg: 0,
    rating_count: 0,
    location: null,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  } as Business
}

describe('public reputation filters', () => {
  it('verified filter uses the actual administrative verification flag', () => {
    const verified = makeBusiness({ id: 'verified', is_verified: true, trust_score: 5 })
    const unverified = makeBusiness({ id: 'unverified', is_verified: false, trust_score: 100 })
    const result = applyFilters([unverified, verified], { ...DEFAULT_FILTERS, verifiedOnly: true })
    expect(result.map((business) => business.id)).toEqual(['verified'])
  })

  it('ranking does not change when participation points alone change', () => {
    const first = makeBusiness({ id: 'first', trust_score: 0 })
    const second = makeBusiness({ id: 'second', trust_score: 100 })
    const result = applyFilters([first, second], { ...DEFAULT_FILTERS, sort: 'quality' })
    expect(result.map((business) => business.id)).toEqual(['first', 'second'])
  })

  it('actual verification, completed orders and reviewed transactions influence quality ordering', () => {
    const unproven = makeBusiness({
      id: 'unproven',
      is_verified: false,
      trust_score: 100,
      rating_avg: 0,
      rating_count: 0,
      successful_orders: 0,
    })
    const proven = makeBusiness({
      id: 'proven',
      is_verified: true,
      trust_score: 0,
      rating_avg: 4.8,
      rating_count: 12,
      successful_orders: 20,
    })
    const result = applyFilters([unproven, proven], { ...DEFAULT_FILTERS, sort: 'quality' })
    expect(result[0]?.id).toBe('proven')
  })

  it('accepts the dedicated supermarket type filter', () => {
    const filters = parseFilters({ type: 'supermarket' })
    expect(filters.types).toEqual(['supermarket'])
    const market = makeBusiness({ id: 'market', business_type: 'supermarket' })
    const restaurant = makeBusiness({ id: 'restaurant', business_type: 'restaurant' })
    const result = applyFilters([restaurant, market], filters)
    expect(result.map((business) => business.id)).toEqual(['market'])
  })

  it('min rating excludes activities without ratings rather than treating them as zero-star reviews', () => {
    const unrated = makeBusiness({ id: 'unrated', rating_avg: 0, rating_count: 0 })
    const rated = makeBusiness({ id: 'rated', rating_avg: 4.4, rating_count: 3 })
    const result = applyFilters([unrated, rated], { ...DEFAULT_FILTERS, minRating: 4 })
    expect(result.map((business) => business.id)).toEqual(['rated'])
  })
})

describe('search result sorting', () => {
  it('defaults text searches to relevance when no sort was selected', () => {
    const filters = { ...DEFAULT_FILTERS, sort: 'quality' as const }
    expect(resolveResultSort(true, undefined, filters)).toBe('relevance')
  })

  it('honors explicit sort choices for text searches', () => {
    expect(resolveResultSort(true, 'newest', { ...DEFAULT_FILTERS, sort: 'newest' })).toBe('newest')
    expect(resolveResultSort(true, 'rating', { ...DEFAULT_FILTERS, sort: 'rating' })).toBe('rating')
  })

  it('does not claim distance sorting when a usable location is missing', () => {
    const filters = parseFilters({ sort: 'distance' })
    expect(filters.sort).toBe('quality')
    expect(resolveResultSort(true, 'distance', filters)).toBe('relevance')
  })

  it('keeps the parsed browsing sort when there is no text query', () => {
    expect(resolveResultSort(false, undefined, { ...DEFAULT_FILTERS, sort: 'newest' })).toBe('newest')
  })
})
