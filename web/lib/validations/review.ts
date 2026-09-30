import { z } from 'zod'

export const reviewSchema = z
  .object({
    taste: z.number().int().min(1).max(5).optional().nullable(),
    value_for_money: z.number().int().min(1).max(5).optional().nullable(),
    speed: z.number().int().min(1).max(5).optional().nullable(),
    experience: z.number().int().min(1).max(5).optional().nullable(),
    comment: z.string().trim().min(10, 'التعليق قصير — 10 حروف على الأقل').max(500, 'التعليق طويل'),
  })
  .refine((d) => d.taste || d.value_for_money || d.speed || d.experience, {
    message: 'لازم تقييم واحد على الأقل',
  })

export const merchantReplySchema = z.object({
  reply: z.string().trim().min(5, 'الرد قصير').max(500, 'الرد طويل'),
})

export type ReviewInput = z.infer<typeof reviewSchema>
