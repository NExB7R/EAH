import { promises as fs } from 'node:fs'
import path from 'node:path'
import { NextResponse } from 'next/server'

const designPath = path.join(process.cwd(), '.eah', 'studio.json')

export async function GET() {
  try {
    const raw = await fs.readFile(designPath, 'utf8')
    return NextResponse.json({ data: JSON.parse(raw) })
  } catch {
    return NextResponse.json({ data: null })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    await fs.mkdir(path.dirname(designPath), { recursive: true })
    await fs.writeFile(designPath, JSON.stringify(data, null, 2), 'utf8')
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}
