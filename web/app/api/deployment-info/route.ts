import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0, must-revalidate',
  'X-Content-Type-Options': 'nosniff',
}

export async function GET(request: Request) {
  const expectedSha = new URL(request.url).searchParams.get('sha')?.toLowerCase()

  if (!expectedSha || !/^[a-f0-9]{40}$/.test(expectedSha)) {
    return NextResponse.json(
      { matches: false, environment: 'unknown' },
      { status: 400, headers: NO_STORE_HEADERS },
    )
  }

  const deployedSha = process.env.VERCEL_GIT_COMMIT_SHA?.toLowerCase()
  const environment = process.env.VERCEL_ENV?.toLowerCase() ?? 'unknown'

  if (!deployedSha || !/^[a-f0-9]{40}$/.test(deployedSha)) {
    return NextResponse.json(
      { matches: false, environment },
      { status: 503, headers: NO_STORE_HEADERS },
    )
  }

  const matches = environment === 'production' && deployedSha === expectedSha

  return NextResponse.json(
    { matches, environment },
    { status: matches ? 200 : 409, headers: NO_STORE_HEADERS },
  )
}
