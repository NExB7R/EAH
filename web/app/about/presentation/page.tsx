import type { Metadata } from 'next'
import PresentationClient from './presentation-client'

export const metadata: Metadata = {
  title: 'اعرض EAH · Presentation',
  description: 'عرض تقديمي لمنصة EAH — من قلب شبين القناطر',
}

export default function PresentationPage() {
  return <PresentationClient />
}
