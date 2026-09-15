/**
 * EAH — Copy & Voice
 * كل نصوص المنصة في مكان واحد.
 * العالثة: مصري كشعبي، أخوي، مش رسمي أبداً.
 * السلوغوان المق؊لس النفيلا بوائت التليمة
 */

export type Gender = 'male' | 'female' | 'unknown'

type GenderMap = { male: string; female: string; unknown: string }

function pick(map: GenderMap, g: Gender = 'unknown'): string {
  return map[g] || map.unknown
}

// Core Phrases

export const SLOGAN = '\u0627\u0644\u0644\u064A \u0646\u0641\u0633\u0643 \u0641\u064A\u0647 \u061F'

export const BROTHER = {
  male: '\u064A\u0627 \u0623\u062E\u0648\u064A\u0627',
  female: '\u064A\u0627 \u0623\u062E\u062A\u064A',
  unknown: '\u064A\u0627 \u0623\u062E\u0648\u0627\u062A\u064A',
}

export const BROTHER_BIZ = {
  male: '\u0623\u062E\u0648\u064A\u0627 \u0627\u0644\u0628\u0632\u0646\u0633',
  female: '\u0623\u062E\u062A\u064A \u0627\u0644\u0628\u0632\u0646\u0633',
  unknown: '\u0634\u0631\u064A\u0643\u0646\u0627',
}

export const WELCOME = {
  male: '\u0646\u0648\u0631\u062A \u064A\u0627 \u0623\u062E\u0648\u064A\u0627',
  female: '\u0646\u0648\u0631\u062A\u064A \u064A\u0627 \u0623\u062E\u062A\u064A',
  unknown: '\u0646\u0648\u0631\u062A',
}

export const COPY = {
  hero: {
    kicker: '\u0623\u0647\u0644\u0627\u064B \u0628\u064A\u0643 \u0641\u064A EAH',
    title: '\u0627\u0644\u0644\u064A \u0646\u0641\u0633\u0643 \u0641\u064A\u0647 \u061F',
    titleAccent: '\u064A\u0644\u0627 \u0628\u064A\u0646\u0627 \u0646\u0644\u0627\u0642\u064A\u0647',
    subtitle: '\u0642\u0648\u0644 \u0644\u0646\u0627 \u0645\u0632\u0627\u062C\u0643',
    cta: {
      discover: '\u062F\u0648\u0631 \u0645\u0639\u0627\u0646\u0627',
      recommend: '\u0642\u0648\u0644 \u0645\u0632\u0627\u062C\u0643',
      signup: '\u0627\u0646\u0636\u0645 \u0644\u064A\u0646\u0627',
    },
  },
  search: {
    placeholder: '\u062F\u0648\u0631 \u0639\u0644\u0649 \u0625\u064A\u0647 \u0627\u0644\u0646\u0647\u0627\u0631\u062F\u0647',
    noResults: {
      title: '\u0645\u0639\u0644\u0634\u060C \u0645\u0641\u064A\u0634 \u062d\u0627\u062C\u0629 \u0647\u0646\u0627',
      body: '\u0644\u0641\u064A\u0646\u0627 \u0648\u0645 \u0644\u0642\u064A\u0646\u0627\u0634',
      cta: '\u0634\u0648\u0641 \u0643\u0644 \u0627\u0644\u0623\u0645\u0627\u0643\u0646',
    },
  },
  account: {
    title: '\u0631\u0649\u0643\u0646 \u0623\u062E\u0648\u064A\u0627',
    greeting: '\u0625\u0632\u064A\u0643',
  },
  merchant: {
    title: '\u0628\u0632\u0646\u0633 \u0623\u062E\u0648\u064A\u0627',
    welcome: '\u0646\u0648\u0631\u062A \u064A\u0627 \u0623\u062E\u0648\u064A\u0627 \u0627\u0644\u0628\u0632\u0646\u0633',
    orders: '\u0627\u0644\u0623\u0648\u0631\u062F\u0631\u0627\u062A \u0627\u0644\u0644\u064A \u062C\u0627\u062A\u0644\u0643',
    menu: '\u0645\u0646\u064A\u0648\u0643',
  },
  empty: {
    generic: {
      title: '\u0644\u0633\u0647 \u0645\u0641\u064A\u0634 \u062d\u0627\u062D\u0629',
      body: '\u0627\u062D\u0646\u0627 \u0628\u0646\u0633\u062A\u0639\u062F \u2014 \u0627\u0633\u062A\u0646\u0627\u0646\u0627 \u0634\u0648\u64A\u0629',
    },
    favorites: {
      title: '\u0644\u0633\u0647 \u0645\u062D\u0627\u0641\u0638\u0630\u0634 \u0639\u0644\u0649 \u062d\u0627\u062D\u0629',
      body: '\u064A\u0644\u0627 \u0646\u062F\u0648\u0631 \u0633\u0648\u0627',
      cta: '\u062f\u0648\u0631 \u0645\u0639\u0627\u0646\u0627',
    },
  },
  error: {
    generic: {
      title: '\u0641\u064A \u062D\u0627\u062C\u0629 \u063A\u0644\u0637',
      body: '\u0647\u0646\u0635\u0644\u062d\u0647\u0627 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627X\u0648\u0641',
      cta: '\u062d\u0627\u0648\u0644 \u062a\u0627\u0646\u064A',
    },
  },
  success: {
    generic: '\u062a\u0645\u0627\u0645 \u2713',
    saved: '\u062A\u0645 \u0627\u0644\u062d\u0641\u0638 \u064A\u0627 \u063A\u0627\u0644\u064A',
  },
} as const

export function greeting(name: string | null | undefined, gender: Gender = 'unknown'): string {
  const first = name?.split(' ')[0]
  if (!first) return pick(WELCOME, gender)
  return pick(WELCOME, gender) + ' \u064A\u0627 ' + first
}

export function address(gender: Gender = 'unknown'): string {
  return pick(BROTHER, gender)
}

export function addressBiz(gender: Gender = 'unknown'): string {
  return pick(BROTHER_BIZ, gender)
}