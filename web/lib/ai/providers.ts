import 'server-only'

// ═══════════════════════════════════════════════════════════
// EAH — AI Provider Router (Multi-Provider Fallback)
//   • 4 مزودين — fallback تلقائي عند الفشل
//   • Groq → Gemini → OpenRouter → Cerebras
//   • تتبع الأعطال + cooldown ذكي
// ═══════════════════════════════════════════════════════════

export type ToolCall = {
  id: string
  type: 'function'
  function: { name: string; arguments: string }
}

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string | null
  tool_calls?: ToolCall[]
  tool_call_id?: string
  name?: string
}

export type ToolDefinition = {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: {
      type: 'object'
      properties: Record<string, unknown>
      required?: string[]
    }
  }
}

export type ChatResponse = {
  choices: {
    message: {
      role: string
      content: string | null
      tool_calls?: ToolCall[]
    }
    finish_reason: string
  }[]
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
  _provider?: string
}

// ─── المزودين ───

type Provider = {
  name: string
  url: string
  model: string
  apiKey: string | undefined
  priority: number
  supportsTools: boolean
  extraHeaders?: Record<string, string>
}

function getProviders(): Provider[] {
  const providers: Provider[] = []

  // 1) Groq — أسرع + 1000 req/day
  if (process.env.GROQ_API_KEY) {
    providers.push({
      name: 'groq',
      url: 'https://api.groq.com/openai/v1/chat/completions',
      model: 'llama-3.3-70b-versatile',
      apiKey: process.env.GROQ_API_KEY,
      priority: 1,
      supportsTools: true,
    })
  }

  // 2) Gemini — 1500 req/day
  if (process.env.GEMINI_API_KEY) {
    providers.push({
      name: 'gemini',
      url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
      model: 'gemini-2.0-flash',
      apiKey: process.env.GEMINI_API_KEY,
      priority: 2,
      supportsTools: true,
    })
  }

  // 3) OpenRouter — $10 → 1000 req/day
  if (process.env.OPENROUTER_API_KEY) {
    providers.push({
      name: 'openrouter',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      model: process.env.OPENROUTER_MODEL ?? 'meta-llama/llama-3.3-70b-instruct:free',
      apiKey: process.env.OPENROUTER_API_KEY,
      priority: 3,
      supportsTools: true,
      extraHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL ?? 'https://eah-sq.vercel.app',
        'X-Title': 'EAH',
      },
    })
  }

  // 4) Cerebras — 14,400 req/day
  if (process.env.CEREBRAS_API_KEY) {
    providers.push({
      name: 'cerebras',
      url: 'https://api.cerebras.ai/v1/chat/completions',
      model: 'llama-3.3-70b',
      apiKey: process.env.CEREBRAS_API_KEY,
      priority: 4,
      supportsTools: true,
    })
  }

  return providers.sort((a, b) => a.priority - b.priority)
}

// ─── Cooldown لإدارة الأعطال ───

const failureCache = new Map<string, number>()
const COOLDOWN_MS = 60_000 // دقيقة

function isAvailable(provider: Provider): boolean {
  const until = failureCache.get(provider.name)
  if (!until) return true
  if (Date.now() > until) {
    failureCache.delete(provider.name)
    return true
  }
  return false
}

function markFailure(provider: Provider) {
  failureCache.set(provider.name, Date.now() + COOLDOWN_MS)
}

// ─── الدالة الرئيسية ───

export async function chatCompletion(
  messages: ChatMessage[],
  tools?: ToolDefinition[],
): Promise<ChatResponse> {
  const providers = getProviders()
  if (providers.length === 0) {
    throw new Error('No AI providers configured')
  }

  const errors: string[] = []

  for (const provider of providers) {
    if (!isAvailable(provider)) {
      errors.push(`${provider.name}: in cooldown`)
      continue
    }

    try {
      const res = await callProvider(provider, messages, tools)
      return { ...res, _provider: provider.name }
    } catch (err) {
      const msg = (err as Error).message
      errors.push(`${provider.name}: ${msg}`)
      console.warn(`[AI] ${provider.name} failed:`, msg)

      // cooldown دقيق: rate limit + server errors + abort
      const isRateLimit = /\b429\b/.test(msg)
      const isServerError = /\b(500|502|503|504)\b/.test(msg)
      const isAbort = (err as Error).name === 'AbortError'

      if (isRateLimit || isServerError || isAbort) {
        markFailure(provider)
      }
    }
  }

  throw new Error(`All providers failed: ${errors.join(' | ')}`)
}

async function callProvider(
  provider: Provider,
  messages: ChatMessage[],
  tools?: ToolDefinition[],
): Promise<ChatResponse> {
  const body: Record<string, unknown> = {
    model: provider.model,
    messages,
    temperature: 0.7,
    max_tokens: 800,
  }

  if (tools && tools.length > 0 && provider.supportsTools) {
    body.tools = tools
    body.tool_choice = 'auto'
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 25_000)

  try {
    const res = await fetch(provider.url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
        ...(provider.extraHeaders ?? {}),
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`${res.status}: ${text.slice(0, 200)}`)
    }

    return (await res.json()) as ChatResponse
  } finally {
    clearTimeout(timeout)
  }
}

// ─── معلومات مفيدة ───
