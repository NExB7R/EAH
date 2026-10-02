import { redirect } from 'next/navigation'

// /notifications → /account/notifications (§26 — مسار واحد)
export default function Page() {
  redirect('/account/notifications')
}
