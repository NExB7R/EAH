export function getVisitorHash(): string {
  if (typeof window === 'undefined') return ''
  const KEY = 'eah-visitor-id'
  let id = localStorage.getItem(KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(KEY, id)
  }
  return id
}

export function getSessionHash(): string {
  if (typeof window === 'undefined') return ''
  const KEY = 'eah-session-id'
  let id = sessionStorage.getItem(KEY)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(KEY, id)
  }
  return id
}
