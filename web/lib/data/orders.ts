// ═══════════════════════════════════════════════════════════════════
// EAH — Orders System v2: Types
// Extends MerchantOrder without breaking it.
// ═══════════════════════════════════════════════════════════════════

export const ORDER_STATUSES = [
  'sent',
  'seen',
  'accepted',
  'rejected',
  'preparing',
  'on_way',
  'delivered',
  'cancelled',
  'expired',
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const PAYMENT_METHODS = ['cash', 'instapay', 'wallet'] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  cash: 'الدفع عند الاستلام',
  instapay: 'InstaPay',
  wallet: 'محفظة إلكترونية',
}

export const PAYMENT_WARNINGS: Record<PaymentMethod, string | null> = {
  cash: null,
  instapay:
    'ممنوع الدفع لأي شخص آخر. الدفع فقط عبر تطبيق InstaPay أو للمندوب الرسمي للنشاط. EAH غير مسؤولة عن أي دفع خارج الإطار.',
  wallet:
    'ممنوع الدفع لأي شخص آخر. الدفع فقط عبر المحفظة الرسمية للنشاط أو للمندوب الرسمي. EAH غير مسؤولة عن أي دفع خارج الإطار.',
}

export const FEEDBACK_ISSUE_TYPES = ['late', 'missing', 'quality', 'payment', 'other'] as const

export type FeedbackIssueType = (typeof FEEDBACK_ISSUE_TYPES)[number]

export const FEEDBACK_ISSUE_LABEL: Record<FeedbackIssueType, string> = {
  late: 'الطلب اتأخر',
  missing: 'فيه حاجة ناقصة',
  quality: 'مش أحسن حاجة',
  payment: 'مشكلة في الدفع',
  other: 'مشكلة تانية',
}

export type OrderAttachment = {
  type: 'image' | 'voice'
  url: string
  size: number
  duration_sec?: number
  mime?: string
}

export type OrderReaction = {
  id: string
  order_id: string
  actor_type: 'customer' | 'merchant' | 'system' | 'admin'
  actor_id: string | null
  action: string
  metadata: Record<string, unknown>
  created_at: string
}

export type MerchantOrderSettings = {
  business_id: string
  orders_enabled: boolean
  deadline_minutes: number
  offline_mode: boolean
  offline_until: string | null
  auto_accept: boolean
  missed_count_today: number
  missed_count_week: number
  last_missed_at: string | null
  suspended_until: string | null
  suspension_reason: string | null
}

export type CustomerOrderStats = {
  profile_id: string
  total_orders: number
  successful_orders: number
  cancelled_orders: number
  no_show_count: number
  total_spent_egp: number
  is_vip: boolean
  last_order_at: string | null
}

export type MerchantOrderFull = {
  id: string
  order_code: string
  status: string
  items: string | null
  notes: string | null
  customer_name: string | null
  customer_phone: string | null
  customer_profile_id: string | null
  created_at: string
  delivery_address: string | null
  payment_method: PaymentMethod | null
  payment_reference: string | null
  attachments: OrderAttachment[]
  secondary_phone: string | null
  deadline_at: string | null
  accepted_at: string | null
  delivered_at: string | null
  feedback_due_at: string | null
  feedback_sent_at: string | null
  feedback_rating: number | null
  feedback_text: string | null
  feedback_issue_type: FeedbackIssueType | null
  snoozed_until: string | null
  expired_at: string | null
}
