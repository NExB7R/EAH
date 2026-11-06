import 'server-only'
import { headers } from 'next/headers'

const DEDICATED_WORKSPACES = ['/auth']

export async function shouldRenderPublicChrome(): Promise<boolean> {
  const pathname = (await headers()).get('x-pathname') ?? '/'
  return !DEDICATED_WORKSPACES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}
