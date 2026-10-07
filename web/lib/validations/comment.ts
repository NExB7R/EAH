import { z } from 'zod'

export const commentSchema = z.object({
  content: z.string().trim().min(1, 'اكتب حاجة').max(500, 'التعليق طويل'),
  parent_id: z.string().uuid().nullable().optional(),
})

export type CommentInput = z.infer<typeof commentSchema>
