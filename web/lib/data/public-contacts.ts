export type PublicContactMethod = {
  method_type: 'facebook' | 'instagram' | 'website'
  value: string
  is_primary: boolean
}

type ContactMethodRecord = {
  method_type: string
  value: string
  is_primary: boolean
}

/** Accept only absolute HTTP(S) URLs for links rendered in public pages. */
export function normalizePublicContactUrl(value: string | null | undefined): string | null {
  const candidate = value?.trim()
  if (!candidate) return null

  try {
    const url = new URL(candidate)
    if (
      (url.protocol !== 'https:' && url.protocol !== 'http:') ||
      !url.hostname ||
      url.username ||
      url.password
    ) {
      return null
    }

    return url.toString()
  } catch {
    return null
  }
}

/**
 * Only validated social/profile URLs are safe in the public business-detail payload.
 * Phone-like methods must go through the authenticated reveal_contact flow.
 */
export function filterPublicContactMethods(
  contacts: readonly ContactMethodRecord[],
): PublicContactMethod[] {
  return contacts.flatMap((contact) => {
    if (
      contact.method_type !== 'facebook' &&
      contact.method_type !== 'instagram' &&
      contact.method_type !== 'website'
    ) {
      return []
    }

    const value = normalizePublicContactUrl(contact.value)
    if (!value) return []

    return [{
      method_type: contact.method_type,
      value,
      is_primary: contact.is_primary,
    }]
  })
}
