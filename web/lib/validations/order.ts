import { z } from 'zod'

export const orderSchema = z.object({
  customer_name: z.string().min(2, 'الاسم قصير').max(60),
  customer_phone: z
    .string()
    .min(11, 'الرقم قصير')
    .max(15)
    .regex(/^[0-9+\s-]+$/, 'الرقم مش صحيح'),
  customer_area: z.string().max(80).optional().or(z.literal('')),
  customer_address: z.string().max(200).optional().or(z.literal('')),
  items_summary: z.string().min(3, 'اكتب طلبك').max(500),
  notes: z.string().max(300).optional().or(z.literal('')),
})
