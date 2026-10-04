export type AnnouncementRow = {
  id: string
  title: string
  body: string | null
  theme: 'gold' | 'purple' | 'orange' | 'teal'
  is_active: boolean
  dismissible: boolean
  link_url: string | null
  link_label: string | null
  starts_at: string | null
  ends_at: string | null
  created_at: string
}
