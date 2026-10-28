import { describe, expect, it } from 'vitest'
import { getReviewDimensions } from './review-dimensions'

describe('review dimension fallbacks', () => {
  it('uses generic quality dimensions for unclassified activities', () => {
    expect(getReviewDimensions('misc', null).map((dimension) => dimension.key)).toEqual([
      'quality',
      'price',
      'reliability',
      'experience',
    ])
  })

  it('uses grocery dimensions for a market subcategory', () => {
    expect(getReviewDimensions('misc', 'ماركت').map((dimension) => dimension.key)).toEqual([
      'availability',
      'price',
      'cleanliness',
      'service',
    ])
  })

  it('uses the expected dimensions for pharmacies and delivery offices', () => {
    expect(getReviewDimensions('pharmacy', null).map((dimension) => dimension.key)).toContain('availability')
    expect(getReviewDimensions('delivery_office', null).map((dimension) => dimension.key)).toContain('reliability')
  })
})
