import { createClient } from '@/lib/supabase-server'
import { isFollowing, getFollowerCount } from '@/lib/follows'
import FollowButton from '@/components/follow-button'

type Props = { slug: string; businessId: string | undefined }

export default async function BusinessFollowSection({ businessId }: Props) {
  if (!businessId) return null

  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()

  const [following, count] = await Promise.all([
    user ? isFollowing(user.id, businessId) : Promise.resolve(false),
    getFollowerCount(businessId),
  ])

  return (
    <div className="biz-actions-row">
      <FollowButton
        businessId={businessId}
        initialFollowing={following}
        initialCount={count}
        isAuthed={!!user}
      />
    </div>
  )
}
