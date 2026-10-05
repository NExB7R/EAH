export type ModerationReview = {
  id: string
  comment: string | null
  rating: number
  status: string
  created_at: string
  flagged_reason: string | null
  user_name: string | null
  business_name: string | null
  business_slug: string | null
}
