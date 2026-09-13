import { z } from 'zod'

export const offerSchema = z.object({
  title: z.string().trim().min(2, 'العنوان قصير').max(120),
  description: z.string().trim().max(500).optional().or(z.literal('')).transform((v) => v || null),
  price: z.string().optional().transform((v) => (v && v !== '' ? Number(v) : null)),
  old_price: z.string().optional().transform((v) => (v && v !== '' ? Number(v) : null)),
  image_url: z.string().trim().optional().or(z.literal('')).transform((v) => v || null),
  starts_at: z.string().optional().or(z.literal('')).transform((v) => (v && v !== '' ? v : null)),
  ends_at: z.string().optional().or(z.literal('')).transform((v) => (v && v !== '' ? v : null)),
  is_published: z.boolean().default(true),
})

export type OfferData = z.output<typeof offerSchema>
