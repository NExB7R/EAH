import { describe, expect, it } from 'vitest'
import type { Business } from '@/lib/data/businesses'
import { filterAndRankNearbyBusinesses } from './nearby'

function business(
  id: string,
  area: string,
  location: { lat: number; lng: number } | null,
  ratingAvg = 0,
): Business {
  return {
    id,
    slug: id,
    name: id,
    area,
    location,
    rating_avg: ratingAvg,
    rating_count: 1,
  } as Business
}

describe('filterAndRankNearbyBusinesses', () => {
  it('keeps only geocoded activities within five kilometers and orders by distance', () => {
    const origin = { lat: 30.323, lng: 31.241 }
    const farther = business('farther', 'قرية قريبة', { lat: 30.333, lng: 31.241 }, 5)
    const nearer = business('nearer', 'شبين القناطر', { lat: 30.324, lng: 31.241 }, 3)
    const outside = business('outside', 'شبين القناطر', { lat: 30.423, lng: 31.241 }, 5)
    const missingCoordinates = business('missing', 'شبين القناطر', null, 5)

    const result = filterAndRankNearbyBusinesses(
      [farther, outside, missingCoordinates, nearer],
      origin,
    )

    expect(result.map((item) => item.id)).toEqual(['nearer', 'farther'])
  })

  it('falls back to Shibin El-Qanater activities when location is unavailable', () => {
    const shibin = business('shibin', 'شبين القناطر', null)
    const village = business('village', 'قرية قريبة', null)

    const result = filterAndRankNearbyBusinesses([shibin, village], null)

    expect(result.map((item) => item.id)).toEqual(['shibin'])
  })

  it('uses the supplied radius and excludes invalid locations', () => {
    const valid = business('valid', 'شبين القناطر', { lat: 30.324, lng: 31.241 })
    const invalid = business('invalid', 'شبين القناطر', { lat: 200, lng: 31.241 })

    const result = filterAndRankNearbyBusinesses([valid, invalid], { lat: 30.323, lng: 31.241 }, 0)

    expect(result).toEqual([])
  })
})
