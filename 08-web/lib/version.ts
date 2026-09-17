/**
 * EAH version — auto from package.json
 * كل مرة تعمل commit و Vercel يبني، الفيرشن يتحدث تلقائي
 */
import pkg from '../package.json'

export const APP_VERSION = pkg.version
export const APP_VERSION_LABEL = `v${APP_VERSION}`

// git commit قصير (Vercel بيوفره تلقائي)
export const APP_COMMIT =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7)) || ''

export const APP_BUILD = APP_COMMIT ? `${APP_VERSION_LABEL}+${APP_COMMIT}` : APP_VERSION_LABEL
