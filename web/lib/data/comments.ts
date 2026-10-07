// ═══════════════════════════════════════════════════════════
// EAH — Comments Data Layer
// ═══════════════════════════════════════════════════════════

import { createClient } from '@/lib/supabase/server'

export type CommentNode = {
  id: string
  business_id: string
  user_id: string
  parent_id: string | null
  content: string
  depth: number
  likes_count: number
  is_edited: boolean
  created_at: string
  author: {
    display_name: string
    avatar_url: string | null
  } | null
  liked_by_me: boolean
  replies: CommentNode[]
}

const COMMENT_SELECT = `
  id, business_id, user_id, parent_id, content, depth, likes_count, is_edited, created_at,
  author:profiles!business_comments_user_id_fkey(display_name, avatar_url)
`

export async function getComments(businessId: string): Promise<CommentNode[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('business_comments')
    .select(COMMENT_SELECT)
    .eq('business_id', businessId)
    .eq('status', 'approved')
    .order('created_at', { ascending: true })

  if (error || !data) return []

  const rows = data as unknown as {
    id: string
    business_id: string
    user_id: string
    parent_id: string | null
    content: string
    depth: number
    likes_count: number
    is_edited: boolean
    created_at: string
    author: { display_name: string; avatar_url: string | null } | null
  }[]

  // liked_by_me
  let likedIds = new Set<string>()
  if (user && rows.length > 0) {
    const { data: likes } = await supabase
      .from('comment_likes')
      .select('comment_id')
      .eq('user_id', user.id)
      .in(
        'comment_id',
        rows.map((r) => r.id),
      )
    likedIds = new Set((likes ?? []).map((l) => (l as { comment_id: string }).comment_id))
  }

  // build tree
  const nodes: Record<string, CommentNode> = {}
  const roots: CommentNode[] = []

  for (const r of rows) {
    nodes[r.id] = {
      ...r,
      liked_by_me: likedIds.has(r.id),
      replies: [],
    }
  }

  for (const id of Object.keys(nodes)) {
    const n = nodes[id]!
    if (n.parent_id && nodes[n.parent_id]) {
      nodes[n.parent_id]!.replies.push(n)
    } else {
      roots.push(n)
    }
  }

  return roots
}
