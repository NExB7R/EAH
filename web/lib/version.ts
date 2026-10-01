// §26 — Single Source of Truth for version
// يقرأ من web/package.json تلقائياً
import pkg from '@/package.json'

export const APP_VERSION = `v${pkg.version}`
