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

/**
 * Only social/profile URLs are safe in the public business-detail payload.
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

    return [{
      method_type: contact.method_type,
      value: contact.value,
      is_primary: contact.is_primary,
    }]
  })
}
