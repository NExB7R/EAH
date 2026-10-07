'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import Avatar from './avatar'
import { HeartIcon, MessageCircleIcon, CloseIcon, BellIcon } from './icons'
import {
  likeComment,
  unlikeComment,
  deleteComment,
  editComment,
  toggleFollowThread,
} from '@/app/comments/actions'
import { createComment } from '@/app/comments/actions'
import type { CommentNode } from '@/lib/data/comments'
import styles from './comment-item.module.css'

type Props = {
  comment: CommentNode
  businessId: string
  slug: string
  currentUserId: string | null
  isLoggedIn: boolean
  isFollowing?: boolean
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
  isFollowing: initialFollowing = false,
}: Props) {
  const [following, setFollowing] = useState(initialFollowing)
  const [liked, setLiked] = useState(comment.liked_by_me)
  const [likesCount, setLikesCount] = useState(comment.likes_count)
  const [showReply, setShowReply] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [showReplies, setShowReplies] = useState(comment.depth < 1)
  const [isPending, startTransition] = useTransition()
  const [editMode, setEditMode] = useState(false)
  const [editText, setEditText] = useState(comment.content)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [content, setContent] = useState(comment.content)
  const [isEdited, setIsEdited] = useState(comment.is_edited)

  const name = comment.author?.display_name ?? 'مستخدم'
  const isMine = currentUserId === comment.user_id
  const isDeleted = comment.content === '[deleted]'
  const images = comment.image_urls ?? []

  // يمكن تعديل التعليق خلال 15 دقيقة — الوقت بيتحسب مرة واحدة عند mount
  const [canEdit] = useState(() => {
    if (!isMine || isDeleted) return false
    const age = Date.now() - new Date(comment.created_at).getTime()
    return age < 15 * 60 * 1000
  })

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

  const handleFollow = () => {
    if (!isLoggedIn) return
    const next = !following
    setFollowing(next)
    startTransition(async () => {
      const res = await toggleFollowThread(comment.id, slug)
      if (!res.ok) {
        setFollowing(!next)
      } else {
        setFollowing(res.following)
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
        {isEdited && <span className={styles.edited}>(معدّل)</span>}
      </div>

      {!isDeleted && !editMode && <p className={styles.content}>{content}</p>}
      {isDeleted && <p className={styles.deleted}>[تعليق محذوف]</p>}

      {editMode && (
        <form
          className={styles.editForm}
          onSubmit={(e) => {
            e.preventDefault()
            if (!editText.trim()) return
            startTransition(async () => {
              const fd = new FormData()
              fd.set('content', editText)
              const res = await editComment(comment.id, slug, fd)
              if (res.ok) {
                setContent(editText)
                setIsEdited(true)
                setEditMode(false)
              }
            })
          }}
        >
          <textarea
            className={styles.replyInput}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            maxLength={500}
            rows={3}
          />
          <div className={styles.replyActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => {
                setEditMode(false)
                setEditText(content)
              }}
            >
              إلغاء
            </button>
            <button
              type="submit"
              className={styles.sendBtn}
              disabled={isPending || !editText.trim()}
            >
              حفظ
            </button>
          </div>
        </form>
      )}

      {!isDeleted && images.length > 0 && (
        <div className={styles.images}>
          {images.map((url, i) => (
            <button
              key={url}
              type="button"
              className={styles.imageBtn}
              onClick={() => setLightbox(url)}
              aria-label={`صورة ${i + 1}`}
            >
              <Image src={url} alt={`صورة ${i + 1}`} fill sizes="88px" className={styles.image} />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(null)}
        >
          <Image
            src={lightbox}
            alt=""
            width={1200}
            height={900}
            className={styles.lightboxImg}
            style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '90vh' }}
          />
          <button
            type="button"
            className={styles.lightboxClose}
            onClick={() => setLightbox(null)}
            aria-label="إغلاق"
          >
            <CloseIcon size={20} />
          </button>
        </div>
      )}

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

        {canEdit && (
          <button type="button" className={styles.action} onClick={() => setEditMode((v) => !v)}>
            <span>تعديل</span>
          </button>
        )}

        {comment.depth === 0 && isLoggedIn && !isMine && (
          <button
            type="button"
            className={`${styles.action} ${following ? styles.actionFollowing : ''}`}
            onClick={handleFollow}
            disabled={isPending}
            aria-label={following ? 'إلغاء متابعة النقاش' : 'تابع النقاش'}
            title={following ? 'إلغاء متابعة الردود' : 'تابع الردود الجديدة'}
          >
            <BellIcon size={13} />
            <span>{following ? 'متابع' : 'تابع'}</span>
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
                  isFollowing={following}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
