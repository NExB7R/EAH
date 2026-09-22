import { NextResponse } from 'next/server'
import { z } from 'zod'

export const runtime = 'nodejs'

const Schema = z.object({
  name: z.enum(['LCP', 'INP', 'CLS', 'FCP', 'TTFB']),
  value: z.number().int().min(0).max(100000),
  id: z.string().max(20),
})

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const parsed = Schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 })

    // بنسجل في الـ logs بس (Vercel Analytics بيتولى الباقي)
    if (process.env.NODE_ENV === 'production') {
      console.log(`[vitals] ${parsed.data.name}=${parsed.data.value}`)
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
