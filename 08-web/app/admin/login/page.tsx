import { redirect } from 'next/navigation'

export const metadata = {
  title: 'دخول الأدمن',
  robots: { index: false, follow: false },
}

export default function AdminLoginPage() {
  redirect('/auth?next=/admin')
}
