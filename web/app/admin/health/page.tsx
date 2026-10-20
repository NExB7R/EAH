import { redirect } from 'next/navigation'

// Technical error logs remain internal for maintenance and debugging.
// Keep old links working without exposing a standalone errors page.
export default function AdminHealthRedirect(): never {
  redirect('/admin')
}
