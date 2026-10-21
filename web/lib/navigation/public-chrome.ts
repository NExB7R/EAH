import 'server-only'

import { headers } from 'next/headers'

const DEDICATED_WORKSPACES = ['/auth', '/admin', '/merchant']

/**
 * Return false for route families with their own shell, before loading
 * public-site data or interactive chrome.
 */
export async function shouldRenderPublicChrome(): Promise<boolean> {
  const pathname = (await headers()).get('x-pathname') ?? '/'

  return !DEDICATED_WORKSPACES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}
