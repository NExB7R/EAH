'use client'

// ═══════════════════════════════════════════════════════════
// EAH — Engagement Tracking
// تذكير تقييم بعد ساعتين من طلب واتساب
// ═══════════════════════════════════════════════════════════

const KEY_PENDING_REVIEWS = 'eah-pending-reviews'
const KEY_INSTALL_ACCEPTED = 'eah-install-accepted'

const REVIEW_DELAY_MS = 2 * 60 * 60 * 1000 // ساعتين

export type PendingReview = {
  businessId: string
  businessSlug: string
  businessName: string
  dueAt: number
}

// ─── تذكير التقييم ───
export function addPendingReview(item: {
  businessId: string
  businessSlug: string
  businessName: string
}): void {
  if (typeof window === 'undefined') return
  const list = readPending().filter((r) => r.businessId !== item.businessId)
  list.push({ ...item, dueAt: Date.now() + REVIEW_DELAY_MS })
  try {
    localStorage.setItem(KEY_PENDING_REVIEWS, JSON.stringify(list.slice(-10)))
  } catch {
    /* ignore */
  }
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
    return Array.isArray(parsed) ? (parsed as PendingReview[]) : []
  } catch {
    return []
  }
}

// ─── Install tracking ───
export function markInstallAccepted(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY_INSTALL_ACCEPTED, '1')
}

export function isInstallAccepted(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(KEY_INSTALL_ACCEPTED) === '1'
}
