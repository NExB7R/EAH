/**
 * EAH version — single source of truth
 * reads from NEXT_PUBLIC_APP_VERSION (set at build time)
 * fallback to package.json version
 */
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? '0.8.4'
export const APP_VERSION_LABEL = `v${APP_VERSION}`
