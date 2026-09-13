import { z } from 'zod'

export const UUID = z.string().uuid()
export const SAFE_TEXT = z.string().trim().min(1).max(2000)
export const SHORT_TEXT = z.string().trim().min(1).max(200)
export const SAFE_SLUG = z.string().trim().regex(/^[a-z0-9-]+$/).max(60)
export const SAFE_EMAIL = z.string().trim().email().max(200)

export function jsonError(message: string, status = 400) {
  return new Response(JSON.stringify({ ok: false, error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export function jsonOk(data: unknown = {}) {
  return new Response(JSON.stringify({ ok: true, ...(data as object) }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
