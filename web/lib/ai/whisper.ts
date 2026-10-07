import 'server-only'

// ═══════════════════════════════════════════════════════════
// EAH — Groq Whisper Client
// whisper-large-v3-turbo — يدعم العربي المصري
// ═══════════════════════════════════════════════════════════

export type TranscribeResult = { ok: true; text: string } | { ok: false; error: string }

export async function transcribeAudio(blob: Blob, language = 'ar'): Promise<TranscribeResult> {
  const key = process.env.GROQ_API_KEY
  if (!key) return { ok: false, error: 'GROQ_API_KEY مش مضبوط' }

  const formData = new FormData()
  formData.append('file', blob, 'audio.webm')
  formData.append('model', 'whisper-large-v3-turbo')
  formData.append('language', language)
  formData.append('response_format', 'json')
  formData.append('temperature', '0')

  try {
    const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}` },
      body: formData,
    })

    if (!res.ok) {
      const t = await res.text().catch(() => '')
      return { ok: false, error: `${res.status}: ${t.slice(0, 200)}` }
    }

    const data = (await res.json()) as { text?: string }
    if (!data.text || !data.text.trim()) {
      return { ok: false, error: 'مفيش صوت واضح' }
    }
    return { ok: true, text: data.text.trim() }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}
