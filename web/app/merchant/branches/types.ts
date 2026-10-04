export type BranchRow = {
  id: string
  business_id: string
  name: string
  area: string
  address_text: string | null
  latitude: number | null
  longitude: number | null
  phone: string | null
  whatsapp: string | null
  is_primary: boolean
  is_active: boolean
  sort_order: number
}
