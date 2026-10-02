'use client'

// ═══════════════════════════════════════════════════════════
// EAH — Engagement Tracking
//   • تتبّع تفاعل (كشف رقم / واتساب / تقييم / تعليق)
//   • جدولة تذكير تقييم بعد ساعتين
//   • طلب تثبيت التطبيق (ذكي)
//   • تسجيل الحدث في DB (تحليلات)
// ═══════════════════════════════════════════════════════════

const KEY_INSTALL_ACCEPTED = 'eah-install-accepted'
const KEY_PENDING_REVIEWS = 'eah-pending-reviews'

export type EngagementAction = 'phone_reveal' | 'whatsapp' | 'review' | 'comment'

export type PendingReview = {
  businessId: string
  businessSlug: string
  businessName: string
  action: EngagementAction
  dueAt: number
}

// ─── تتبّع حدث ───
export function markInstallAccepted(): void {
  localStorage.setItem(KEY_INSTALL_ACCEPTED, '1')
}

// ─── تذكير التقييم ───
export function getDueReview(): PendingReview | null {
  if (typeof window === 'undefined') return null
  const now = Date.now()
  return readPending().find((r) => r.dueAt <= now) ?? null
}

export function markReviewDone(businessId: string): void {
  const next = readPending().filter((r) => r.businessId !== businessId)
  localStorage.setItem(KEY_PENDING_REVIEWS, JSON.stringify(next))
}

function readPending(): PendingReview[] {
  try {
    const raw = localStorage.getItem(KEY_PENDING_REVIEWS)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// ─── تسجيل في DB (تحليلات) ───
