"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import TrialCountdown from './trial-countdown'

export default function BusinessOwnerTrial({ businessId }: { businessId: string }) {
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    let alive = true
    void (async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !alive) return
      const { data: biz } = await supabase
        .from('businesses')
        .select('owner_profile_id')
        .eq('id', businessId)
        .maybeSingle()
      if (alive && biz?.owner_profile_id === user.id) setIsOwner(true)
    })()
    return () => { alive = false }
  }, [businessId])

  if (!isOwner) return null
  return <TrialCountdown businessId={businessId} />
}
