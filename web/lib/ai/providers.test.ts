import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

// ═══════════════════════════════════════════════════════════
// حراسة ضد الموديلات القديمة/المحذوفة
// السبب: مزودين بيشيلوا موديلات بدون إنذار (شوف LESSONS)
// ═══════════════════════════════════════════════════════════

const DEPRECATED_MODELS = [
  'llama-3.3-70b-versatile', // Groq — اتشال 2026-10-07
  'gemini-2.0-flash', // Gemini — اتشال 2026-10-07
  'meta-llama/llama-3.3-70b-instruct:free', // OpenRouter — free tier اتشال
]

describe('AI provider models', () => {
  const src = readFileSync(join(__dirname, 'providers.ts'), 'utf-8')

  it.each(DEPRECATED_MODELS)('does not use deprecated model: %s', (model) => {
    expect(src).not.toContain(model)
  })

  it('has at least 3 providers configured', () => {
    const matches = src.match(/providers\.push\(/g) ?? []
    expect(matches.length).toBeGreaterThanOrEqual(3)
  })

  it('uses timeout on all fetch calls', () => {
    // كل callProvider لازم تستخدم AbortController
    expect(src).toContain('AbortController')
    expect(src).toContain('controller.abort')
  })
})
