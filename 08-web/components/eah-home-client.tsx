'use client'

import { EahRender, type EahBusiness, type EahPageData } from '@/components/eah-page-builder-pro2'

export default function EahHomeClient({ businesses, data }: { businesses: EahBusiness[]; data: EahPageData }) {
  return <EahRender data={data} businesses={businesses} />
}
