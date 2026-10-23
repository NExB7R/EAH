import { z } from 'zod'

export const PAYMENT_METHOD_VALUES = ['cash', 'instapay', 'wallet'] as const

export const orderSchema = z.object({
  customer_name: z.string().min(2, 'الاسم قصير').max(60),
  customer_phone: z
    .string()
    .min(11, 'الرقم قصير')
    .max(15)
    .regex(/^[0-9+\s-]+$/, 'الرقم مش صحيح'),
  secondary_phone: z.string().max(15).optional().or(z.literal('')),
  customer_area: z.string().max(80).optional().or(z.literal('')),
  customer_address: z.string().max(200).optional().or(z.literal('')),
  items_summary: z.string().max(500).optional().or(z.literal('')),
  notes: z.string().max(300).optional().or(z.literal('')),
  payment_method: z.enum(PAYMENT_METHOD_VALUES).optional().nullable(),
  attachments_json: z.string().max(5000).optional().or(z.literal('')),
})

export type OrderInput = z.infer<typeof orderSchema>

// Custom guard — at least one content source (text / audio / image)
export function orderHasContent(d: { items_summary: string; attachments_json: string }): boolean {
  if (d.items_summary.trim().length >= 3) return true
  if (d.attachments_json.trim().length > 0) {
    try {
      const arr = JSON.parse(d.attachments_json)
      if (Array.isArray(arr) && arr.length > 0) return true
    } catch {
      return false
    }
  }
  return false
}
