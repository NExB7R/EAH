import { describe, expect, it } from 'vitest'
import type { Business } from '@/lib/data/businesses'
import { smartSearch } from './index'

function makeBusiness(index: number): Business {
  return {
    id: String(index),
    slug: `target-${index}`,
    name: `target activity ${index}`,
    business_type: 'misc',
    subcategory: null,
    description: null,
    hook: null,
    area: null,
    city: null,
    address_text: null,
    map_url: null,
    cover_image_url: null,
    logo_url: null,
    is_open: false,
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
  }
}

describe('smartSearch discovery result bounds', () => {
  it('can return more than 200 matches when the caller requests up to 500', () => {
    const businesses = Array.from({ length: 250 }, (_, index) => makeBusiness(index))
    expect(smartSearch(businesses, 'target', 500)).toHaveLength(250)
  })

  it('never returns more than 500 results', () => {
    const businesses = Array.from({ length: 520 }, (_, index) => makeBusiness(index))
    expect(smartSearch(businesses, 'target', 520)).toHaveLength(500)
  })
})
