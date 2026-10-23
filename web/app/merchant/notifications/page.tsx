import { redirect } from 'next/navigation'

// Merchant notifications → /account/notifications (single source of truth)
// The user notifications page filters by user_id, and business owner
// is a user — so order_new + order_status land there naturally.

export default function MerchantNotificationsPage() {
  redirect('/account/notifications')
}
