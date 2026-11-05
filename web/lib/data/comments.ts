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
  image_urls: string[]
  created_at: string
  author: {
    display_name: string
    avatar_url: string | null
  } | null
  liked_by_me: boolean
  replies: CommentNode[]
}

const COMMENT_SELECT = `
  id, business_id, user_id, parent_id, content, depth, likes_count, is_edited, image_urls, created_at,
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
    image_urls: string[]
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

// ─── إيجاد التعليق الجذر (root) ───
export async function getRootCommentId(commentId: string): Promise<string | null> {
  const supabase = await createClient()
  let currentId: string | null = commentId

  // Comment depth is constrained to 0–2, so at most three reads are valid.
  for (let hops = 0; currentId && hops <= 2; hops++) {
    const result = await supabase
      .from('business_comments')
      .select('id, parent_id')
      .eq('id', currentId)
      .eq('status', 'approved')
      .maybeSingle()

    if (result.error || !result.data) return null

    const row: { id: string; parent_id: string | null } = result.data
    if (!row.parent_id) return row.id
    currentId = row.parent_id
  }

  // Never treat a truncated parent chain as a root.
  return null
}

// ─── هل المستخدم متابع الـ thread؟ ───
export async function isFollowingThread(userId: string, rootCommentId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('comment_thread_follows')
    .select('id')
    .eq('user_id', userId)
    .eq('root_comment_id', rootCommentId)
    .maybeSingle()
  return !!data
}

// ─── كل متابعين الـ thread ───
export async function getThreadFollowers(rootCommentId: string): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('comment_thread_follows')
    .select('user_id')
    .eq('root_comment_id', rootCommentId)
  return (data ?? []).map((r) => (r as { user_id: string }).user_id)
}

// ─── كل الـ root comments اللي المستخدم متابعها (لنشاط معين) ───
export async function getMyFollowingRootIds(businessId: string, userId: string): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('comment_thread_follows')
    .select('root_comment_id')
    .eq('user_id', userId)
    .eq('business_id', businessId)
  return (data ?? []).map((r) => (r as { root_comment_id: string }).root_comment_id)
}
