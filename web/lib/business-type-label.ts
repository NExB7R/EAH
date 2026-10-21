export type BusinessTypeLabelInput = {
  business_type: string
  custom_business_type?: string | null
  business_type_status?: string | null
}

const BUILT_IN_LABELS: Record<string, string> = {
  restaurant: 'مطعم',
  pharmacy: 'صيدلية',
  supermarket: 'ماركت',
  delivery_office: 'توصيل',
  misc: 'أخرى',
}

/**
 * A proposed custom label is public-facing only after admin approval.
 * Until then the activity remains visible under the safe built-in category.
 */
export function getBusinessTypeLabel(business: BusinessTypeLabelInput): string {
  const customType = business.custom_business_type?.trim()
  if (business.business_type === 'misc' && business.business_type_status === 'approved' && customType) {
    return customType
  }

  return BUILT_IN_LABELS[business.business_type] ?? BUILT_IN_LABELS.misc!
}
