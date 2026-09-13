export type SubscriptionStatus =
  | 'pending'
  | 'trial'
  | 'active'
  | 'expired'
  | 'rejected'
  | 'cancelled'

export type SubscriptionFeature =
  | 'featured_badge'
  | 'priority_ranking'
  | 'one_ad'
  | 'three_ads'
  | 'unlimited_ads'
  | 'offers_gallery'
  | 'priority_support'

export type SubscriptionPlan = {
  id: string
  code: string
  name_ar: string
  description: string | null
  duration_days: number
  price_egp: number | null
  trial_days: number
  features: SubscriptionFeature[]
  display_order: number
  is_active: boolean
}

export type BusinessSubscription = {
  subscription_id: string
  plan_code: string | null
  plan_name: string | null
  status: SubscriptionStatus
  is_trial: boolean
  starts_at: string | null
  expires_at: string | null
  days_left: number | null
  features: SubscriptionFeature[]
}

export type SubscriptionRequest = {
  id: string
  business_id: string
  plan_id: string | null
  status: SubscriptionStatus
  is_trial: boolean
  starts_at: string | null
  expires_at: string | null
  rejected_reason: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // joined
  business?: { name: string; slug: string; business_type: string }
  plan?: { code: string; name_ar: string }
  owner?: { display_name: string | null; phone: string | null }
}
