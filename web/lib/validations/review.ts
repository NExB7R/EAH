import { z } from 'zod'

const dimensionKey = z.enum([
  'taste',
  'cleanliness',
  'service',
  'price',
  'speed',
  'freshness',
  'variety',
  'availability',
  'quality',
  'reliability',
  'atmosphere',
  'presentation',
  'experience',
])

export const reviewSchema = z
  .object({
    // Zod 4: partialRecord يسمح بأي subset من الـ keys
    dimensions: z.partialRecord(dimensionKey, z.number().int().min(1).max(5)),
    comment: z.string().trim().min(10, 'التعليق قصير — 10 حروف على الأقل').max(500, 'التعليق طويل'),
  })
  .refine((d) => Object.keys(d.dimensions).length >= 1, {
    message: 'لازم تقييم بُعد واحد على الأقل',
  })

export const merchantReplySchema = z.object({
  reply: z.string().trim().min(5, 'الرد قصير').max(500, 'الرد طويل'),
})
