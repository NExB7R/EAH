import { describe, expect, it } from 'vitest'
import { AREAS } from '@/lib/data/areas'
import { applySchema, resolveWhatsappNumber } from './merchant'

const validApplication = {
  name: 'نشاط تجريبي',
  business_type: 'restaurant',
  area: AREAS[0]!,
  city: 'شبين القناطر',
  description: 'وصف واضح للنشاط التجريبي',
  hook: null,
  phone: '01012345678',
  whatsapp: null,
  facebook: null,
  instagram: null,
  address_text: 'شارع تجريبي بجوار الميدان',
  latitude: null,
  longitude: null,
  agree_terms: true,
}

describe('merchant activity application validation', () => {
  it('accepts supermarket as a built-in business type', () => {
    expect(
      applySchema.safeParse({ ...validApplication, business_type: 'supermarket' }).success,
    ).toBe(true)
  })

  it('requires a custom label for the other-activities category', () => {
    expect(applySchema.safeParse({ ...validApplication, business_type: 'misc' }).success).toBe(
      false,
    )
    expect(
      applySchema.safeParse({
        ...validApplication,
        business_type: 'misc',
        custom_business_type: 'مغسلة ملابس',
      }).success,
    ).toBe(true)
  })

  it('requires latitude and longitude together', () => {
    expect(
      applySchema.safeParse({
        ...validApplication,
        latitude: 30.13,
        longitude: null,
      }).success,
    ).toBe(false)
    expect(
      applySchema.safeParse({
        ...validApplication,
        latitude: 30.13,
        longitude: 31.25,
      }).success,
    ).toBe(true)
  })

  it('uses the main phone as WhatsApp when no different number is supplied', () => {
    expect(resolveWhatsappNumber('01012345678', null)).toBe('01012345678')
    expect(resolveWhatsappNumber('01012345678', ' 01112345678 ')).toBe('01112345678')
  })
})
