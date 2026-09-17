/**
 * Client-side helper: يولّد token ثابت لكل جهاز.
 * ده مش hash نهائي — السيرفر بيعيد خلطه مع IP+UA.
 */

export function getClientToken(): string {
  if (typeof window === 'undefined') return ''
  const KEY = 'eah-client-token'
  let id = localStorage.getItem(KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(KEY, id)
  }
  return id
}

export function getSessionToken(): string {
  if (typeof window === 'undefined') return ''
  const KEY = 'eah-session-token'
  let id = sessionStorage.getItem(KEY)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(KEY, id)
  }
  return id
}
