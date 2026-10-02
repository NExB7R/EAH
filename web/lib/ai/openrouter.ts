import 'server-only'

// ═══════════════════════════════════════════════════════════
// EAH — OpenRouter Client
// ═══════════════════════════════════════════════════════════

const API_URL = 'https://openrouter.ai/api/v1/chat/completions'

// موديل مجاني وسريع
const MODEL = process.env.OPENROUTER_MODEL ?? 'meta-llama/llama-3.3-70b-instruct:free'

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
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

export type OpenRouterResponse = {
  choices: {
    message: {
      role: string
      content: string | null
      tool_calls?: {
        id: string
        type: 'function'
        function: { name: string; arguments: string }
      }[]
    }
    finish_reason: string
  }[]
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
}

export async function chatCompletion(
  messages: ChatMessage[],
  tools?: ToolDefinition[],
): Promise<OpenRouterResponse> {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) throw new Error('OPENROUTER_API_KEY not set')

  const body: Record<string, unknown> = {
    model: MODEL,
    messages,
    temperature: 0.7,
    max_tokens: 800,
  }
  if (tools && tools.length > 0) {
    body.tools = tools
    body.tool_choice = 'auto'
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL ?? 'https://eah-sq.vercel.app',
      'X-Title': 'EAH',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 200)}`)
  }

  return (await res.json()) as OpenRouterResponse
}
