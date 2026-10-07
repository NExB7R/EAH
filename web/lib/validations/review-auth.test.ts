import { describe, it, expect } from 'vitest'
import { signupSchema, loginSchema } from './auth'
import { reviewSchema, merchantReplySchema } from './review'

describe('signupSchema', () => {
  it('بيقبل بيانات صحيحة', () => {
    const result = signupSchema.safeParse({
      display_name: 'محمد',
      phone: '01012345678',
      password: 'Test1234',
      confirm_password: 'Test1234',
    })
    expect(result.success).toBe(true)
  })

  it('بيرفض رقم غلط', () => {
    const result = signupSchema.safeParse({
      display_name: 'محمد',
      phone: '12345',
      password: 'Test1234',
      confirm_password: 'Test1234',
    })
    expect(result.success).toBe(false)
  })

  it('بيرفض رقم مش مصري', () => {
    const result = signupSchema.safeParse({
      display_name: 'محمد',
      phone: '05012345678',
      password: 'Test1234',
      confirm_password: 'Test1234',
    })
    expect(result.success).toBe(false)
  })

  it('بيرفض باسورد قصير', () => {
    const result = signupSchema.safeParse({
      display_name: 'محمد',
      phone: '01012345678',
      password: '123',
      confirm_password: '123',
    })
    expect(result.success).toBe(false)
  })

  it('بيرفض اسم قصير', () => {
    const result = signupSchema.safeParse({
      display_name: 'م',
      phone: '01012345678',
      password: 'Test1234',
      confirm_password: 'Test1234',
    })
    expect(result.success).toBe(false)
  })

  it('بيرفض لو كلمتين السر مختلفتين', () => {
    const result = signupSchema.safeParse({
      display_name: 'محمد',
      phone: '01012345678',
      password: 'Test1234',
      confirm_password: 'Other1234',
    })
    expect(result.success).toBe(false)
  })
})

describe('loginSchema', () => {
  it('بيقبل بيانات صحيحة', () => {
    const result = loginSchema.safeParse({
      phone: '01012345678',
      password: 'Test1234',
    })
    expect(result.success).toBe(true)
  })

  it('بيرفض رقم غلط', () => {
    const result = loginSchema.safeParse({
      phone: 'wrong',
      password: 'Test1234',
    })
    expect(result.success).toBe(false)
  })

  it('بيرفض باسورد فاضي', () => {
    const result = loginSchema.safeParse({
      phone: '01012345678',
      password: '',
    })
    expect(result.success).toBe(false)
  })
})

describe('reviewSchema', () => {
  it('بيقبل تقييم كامل صحيح', () => {
    const result = reviewSchema.safeParse({
      dimensions: { experience: 5, taste: 4, price: 5, speed: 3 },
      comment: 'تجربة جميلة جداً والمكان نظيف',
    })
    expect(result.success).toBe(true)
  })

  it('بيقبل تقييم بدون كل الفئات (يكفي واحد)', () => {
    const result = reviewSchema.safeParse({
      dimensions: { experience: 4 },
      comment: 'تجربة جميلة جداً',
    })
    expect(result.success).toBe(true)
  })

  it('بيرفض تقييم بدون أي فئة', () => {
    const result = reviewSchema.safeParse({
      dimensions: {},
      comment: 'تجربة جميلة جداً',
    })
    expect(result.success).toBe(false)
  })

  it('بيرفض تعليق قصير', () => {
    const result = reviewSchema.safeParse({
      dimensions: { experience: 5 },
      comment: 'حلو',
    })
    expect(result.success).toBe(false)
  })

  it('بيرفض تعليق طويل (> 500)', () => {
    const result = reviewSchema.safeParse({
      dimensions: { experience: 5 },
      comment: 'أ'.repeat(501),
    })
    expect(result.success).toBe(false)
  })

  it('بيرفض تقييم < 1 أو > 5', () => {
    expect(
      reviewSchema.safeParse({ dimensions: { experience: 0 }, comment: 'test test test' }).success,
    ).toBe(false)
    expect(
      reviewSchema.safeParse({ dimensions: { experience: 6 }, comment: 'test test test' }).success,
    ).toBe(false)
  })

  it('بيرفض بُعد غير معروف', () => {
    const result = reviewSchema.safeParse({
      dimensions: { unknown_dimension: 5 },
      comment: 'test test test',
    })
    expect(result.success).toBe(false)
  })
})

describe('merchantReplySchema', () => {
  it('بيقبل رد صحيح', () => {
    const result = merchantReplySchema.safeParse({
      reply: 'شكراً لك على تقييمك',
    })
    expect(result.success).toBe(true)
  })

  it('بيرفض رد قصير (< 5)', () => {
    const result = merchantReplySchema.safeParse({
      reply: 'شكرا',
    })
    expect(result.success).toBe(false)
  })

  it('بيرفض رد طويل (> 500)', () => {
    const result = merchantReplySchema.safeParse({
      reply: 'أ'.repeat(501),
    })
    expect(result.success).toBe(false)
  })
})
