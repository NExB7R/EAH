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
const REVIEW_DELAY_MS = 2 * 60 * 60 * 1000

export type EngagementAction =
  | 'phone_reveal'
  | 'whatsapp'
  | 'review'
  | 'comment'

export type BusinessRef = {
  id: string
  slug: string
  name: string
}

export type PendingReview = {
  businessId: string
  businessSlug: string
  businessName: string
  action: EngagementAction
  dueAt: number
}

// ─── تتبّع حدث ───
export function trackEngagement(
  action: EngagementAction,
  business: BusinessRef,
): void {
  if (typeof window === 'undefined') return

  // 1. جدولة تذكير التقييم (للتواصل فقط)
  if (action === 'phone_reveal' || action === 'whatsapp') {
    scheduleReview(business, action)
  }

  // 2. اطلب تثبيت التطبيق (لو ينفع)
  requestInstall()

  // 3. سجّل الحدث (fire-and-forget)
  logEvent(action, business.id)
}

// ─── طلب تثبيت التطبيق ───
export function requestInstall(): void {
  if (typeof window === 'undefined') return
  if (window.matchMedia('(display-mode: standalone)').matches) return
  if (localStorage.getItem(KEY_INSTALL_ACCEPTED) === '1') return
  window.dispatchEvent(new CustomEvent('eah:show-install'))
}

export function markInstallAccepted(): void {
  localStorage.setItem(KEY_INSTALL_ACCEPTED, '1')
}

// ─── تذكير التقييم ───
function scheduleReview(business: BusinessRef, action: EngagementAction): void {
  const list = readPending()
  if (list.some((r) => r.businessId === business.id)) return

  list.push({
    businessId: business.id,
    businessSlug: business.slug,
    businessName: business.name,
    action,
    dueAt: Date.now() + REVIEW_DELAY_MS,
  })
  localStorage.setItem(KEY_PENDING_REVIEWS, JSON.stringify(list))
}

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
async function logEvent(action: EngagementAction, businessId: string): Promise<void> {
  try {
    await fetch('/api/track-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, businessId }),
      keepalive: true,
    })
  } catch {
    // صامت — التحليلات مش حرجة
  }
}
