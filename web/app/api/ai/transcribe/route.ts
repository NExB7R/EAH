import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { transcribeAudio } from '@/lib/ai/whisper'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const runtime = 'nodejs'
export const maxDuration = 30

let limiter: Ratelimit | null = null
function getLimiter(): Ratelimit | null {
  if (limiter) return limiter
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  limiter = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(20, '10 m'),
    prefix: 'whisper',
  })
  return limiter
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const rl = getLimiter()
    if (rl) {
      const key = user?.id ?? req.headers.get('x-forwarded-for') ?? 'anon'
      const { success } = await rl.limit(key)
      if (!success) {
        return NextResponse.json({ error: 'كثير شوية — استنى شوية' }, { status: 429 })
      }
    }

    const form = await req.formData()
    const file = form.get('audio')
    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: 'مفيش صوت' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'الصوت طويل — سجّل أقل' }, { status: 400 })
    }

    const result = await transcribeAudio(file)
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ text: result.text })
  } catch (e) {
    console.error('[transcribe]', (e as Error).message)
    return NextResponse.json({ error: 'حصلت مشكلة — جرب تاني' }, { status: 500 })
  }
}
