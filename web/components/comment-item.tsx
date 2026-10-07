'use client'

import { useState, useTransition } from 'react'
import Avatar from './avatar'
import { HeartIcon, MessageCircleIcon, CloseIcon } from './icons'
import { likeComment, unlikeComment, deleteComment } from '@/app/comments/actions'
import { createComment } from '@/app/comments/actions'
import type { CommentNode } from '@/lib/data/comments'
import styles from './comment-item.module.css'

type Props = {
  comment: CommentNode
  businessId: string
  slug: string
  currentUserId: string | null
  isLoggedIn: boolean
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'الآن'
  if (mins < 60) return `قبل ${mins} دقيقة`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `قبل ${hrs} ساعة`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `قبل ${days} يوم`
  return d.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })
}

export default function CommentItem({
  comment,
  businessId,
  slug,
  currentUserId,
  isLoggedIn,
}: Props) {
  const [liked, setLiked] = useState(comment.liked_by_me)
  const [likesCount, setLikesCount] = useState(comment.likes_count)
  const [showReply, setShowReply] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [showReplies, setShowReplies] = useState(comment.depth < 1)
  const [isPending, startTransition] = useTransition()

  const name = comment.author?.display_name ?? 'مستخدم'
  const isMine = currentUserId === comment.user_id
  const isDeleted = comment.content === '[deleted]'

  const handleLike = () => {
    if (!isLoggedIn) return
    const next = !liked
    setLiked(next)
    setLikesCount((c) => c + (next ? 1 : -1))
    startTransition(async () => {
      const res = next ? await likeComment(comment.id, slug) : await unlikeComment(comment.id, slug)
      if (!res.ok) {
        setLiked(!next)
        setLikesCount((c) => c + (next ? -1 : 1))
      }
    })
  }

  const handleDelete = () => {
    if (!confirm('متأكد تحذف التعليق؟')) return
    startTransition(async () => {
      await deleteComment(comment.id, slug)
    })
  }

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim()) return
    startTransition(async () => {
      const fd = new FormData()
      fd.set('content', replyText)
      fd.set('parent_id', comment.id)
      const res = await createComment(businessId, slug, fd)
      if (res.ok) {
        setReplyText('')
        setShowReply(false)
        setShowReplies(true)
      }
    })
  }

  return (
    <div className={styles.wrap} data-depth={comment.depth}>
      <div className={styles.head}>
        <Avatar
          displayName={name}
          avatarUrl={comment.author?.avatar_url ?? null}
          role="customer"
          size="xs"
        />
        <span className={styles.name}>{name}</span>
        <span className={styles.dot}>·</span>
        <span className={styles.date}>{formatDate(comment.created_at)}</span>
        {comment.is_edited && <span className={styles.edited}>(معدّل)</span>}
      </div>

      {!isDeleted && <p className={styles.content}>{comment.content}</p>}
      {isDeleted && <p className={styles.deleted}>[تعليق محذوف]</p>}

      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.action} ${liked ? styles.actionActive : ''}`}
          onClick={handleLike}
          disabled={!isLoggedIn || isPending}
          aria-label="إعجاب"
        >
          <HeartIcon size={13} />
          {likesCount > 0 && <span>{likesCount}</span>}
        </button>

        {isLoggedIn && comment.depth < 2 && (
          <button type="button" className={styles.action} onClick={() => setShowReply((v) => !v)}>
            <MessageCircleIcon size={13} />
            <span>رد</span>
          </button>
        )}

        {isMine && (
          <button
            type="button"
            className={`${styles.action} ${styles.actionDanger}`}
            onClick={handleDelete}
            disabled={isPending}
            aria-label="حذف"
          >
            <CloseIcon size={13} />
          </button>
        )}
      </div>

      {showReply && (
        <form className={styles.replyForm} onSubmit={handleReplySubmit}>
          <textarea
            className={styles.replyInput}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="اكتب ردك..."
            maxLength={500}
            rows={2}
          />
          <div className={styles.replyActions}>
            <button type="button" className={styles.cancelBtn} onClick={() => setShowReply(false)}>
              إلغاء
            </button>
            <button
              type="submit"
              className={styles.sendBtn}
              disabled={isPending || !replyText.trim()}
            >
              رد
            </button>
          </div>
        </form>
      )}

      {comment.replies.length > 0 && (
        <>
          {!showReplies && (
            <button
              type="button"
              className={styles.showReplies}
              onClick={() => setShowReplies(true)}
            >
              شوف {comment.replies.length} رد
            </button>
          )}
          {showReplies && (
            <div className={styles.replies}>
              {comment.replies.map((r) => (
                <CommentItem
                  key={r.id}
                  comment={r}
                  businessId={businessId}
                  slug={slug}
                  currentUserId={currentUserId}
                  isLoggedIn={isLoggedIn}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
