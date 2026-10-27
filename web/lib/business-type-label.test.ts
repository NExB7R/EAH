import { describe, expect, it } from 'vitest'
import { getBusinessTypeLabel } from './business-type-label'

describe('getBusinessTypeLabel', () => {
  it('uses the built-in "other" label before custom-type approval', () => {
    expect(
      getBusinessTypeLabel({
        business_type: 'misc',
        custom_business_type: 'مغسلة ملابس',
        business_type_status: 'pending',
      }),
    ).toBe('أخرى')

    expect(
      getBusinessTypeLabel({
        business_type: 'misc',
        custom_business_type: 'مغسلة ملابس',
        business_type_status: 'rejected',
      }),
    ).toBe('أخرى')
  })

  it('uses the custom label only after admin approval', () => {
    expect(
      getBusinessTypeLabel({
        business_type: 'misc',
        custom_business_type: '  مغسلة ملابس  ',
        business_type_status: 'approved',
      }),
    ).toBe('مغسلة ملابس')
  })

  it('uses built-in labels and falls back safely for unknown categories', () => {
    expect(getBusinessTypeLabel({ business_type: 'pharmacy' })).toBe('صيدلية')
    expect(getBusinessTypeLabel({ business_type: 'supermarket' })).toBe('ماركت')
    expect(getBusinessTypeLabel({ business_type: 'future-type' })).toBe('أخرى')
    expect(
      getBusinessTypeLabel({
        business_type: 'misc',
        custom_business_type: '   ',
        business_type_status: 'approved',
      }),
    ).toBe('أخرى')
  })
})
