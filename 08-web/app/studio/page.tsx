import { redirect } from 'next/navigation'

export const metadata = {
  title: 'استوديو',
  robots: { index: false, follow: false },
}

export default function StudioRedirect() {
  redirect('/admin/studio')
}
