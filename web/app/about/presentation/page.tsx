import type { Metadata } from 'next'
import PresentationClient from './presentation-client'

export const metadata: Metadata = {
  title: 'عرض تقديمي',
  description: 'عرض تقديمي لمنصة EAH — من قلب شبين القناطر',
}

export default function PresentationPage() {
  return <PresentationClient />
}
