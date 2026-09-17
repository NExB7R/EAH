/**
 * EAH Smart Bot — Intent Matcher
 * يعتمد على matchIntent من knowledge-base
 */

import { matchIntent, type Context, type Intent } from './knowledge-base'

export type { Intent, Context }
export { matchIntent }

/** يبني سياق المستخدم من المتصفح */
export function buildContext(): Context {
  if (typeof window === 'undefined') {
    return { isGuest: true, currentPath: '/' }
  }
  return {
    isGuest: !document.cookie.includes('sb-'),
    currentPath: window.location.pathname,
  }
}

/** يحفظ المحادثة في localStorage (آخر 20 رسالة) */
const STORAGE_KEY = 'eah-bot-history'
const MAX_HISTORY = 20

export type Message = {
  id: string
  role: 'user' | 'bot'
  text: string
  timestamp: number
  quickReplies?: { label: string; action: 'reply' | 'link'; value: string }[]
}

export function loadHistory(): Message[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.slice(-MAX_HISTORY) : []
  } catch {
    return []
  }
}

export function saveHistory(messages: Message[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_HISTORY)))
  } catch {
    /* silent */
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* silent */
  }
}

/** يعمل reply للبوت */
export function generateReply(input: string, ctx: Context): Message {
  const intent = matchIntent(input, ctx)
  const id = `bot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

  if (intent) {
    return {
      id,
      role: 'bot',
      text: intent.response,
      timestamp: Date.now(),
      quickReplies: intent.quickReplies,
    }
  }

  return {
    id,
    role: 'bot',
    text: 'معلش، مش فاهم بالظبط \n\nتحب أعرفك على EAH بشكل عام؟ أو كلّمنا واتساب وهنساعدك شخصياً.',
    timestamp: Date.now(),
    quickReplies: [
      { label: ' إيه هو EAH؟', action: 'reply', value: 'المنصة إيه؟' },
      { label: 'واتساب', action: 'link', value: 'https://wa.me/201012892806' },
    ],
  }
}
