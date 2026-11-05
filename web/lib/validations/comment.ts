import { z } from 'zod'

export const commentImageUrlsSchema = z
  .array(z.string().url().refine((value) => value.startsWith('https://')))
  .max(3)

export const commentSchema = z.object({
  content: z.string().trim().min(1, 'اكتب حاجة').max(500, 'التعليق طويل'),
  parent_id: z.string().uuid().nullable().optional(),
})

export type CommentInput = z.infer<typeof commentSchema>
