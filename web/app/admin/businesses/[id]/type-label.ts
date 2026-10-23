export const TYPE_LABEL: Record<string, string> = {
  restaurant: 'مطعم',
  pharmacy: 'صيدلية',
  delivery_office: 'توصيل',
  misc: 'أخرى',
}

export function typeLabel(type: string): string {
  return TYPE_LABEL[type] ?? type
}

export function statusOf(biz: { is_published: boolean; rejected_at: string | null }): {
  key: 'published' | 'rejected' | 'pending'
  label: string
} {
  if (biz.is_published) return { key: 'published', label: 'منشور' }
  if (biz.rejected_at) return { key: 'rejected', label: 'مرفوض' }
  return { key: 'pending', label: 'بانتظار المراجعة' }
}
