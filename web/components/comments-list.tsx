'use client'

import { useState, useTransition } from 'react'
import CommentItem from './comment-item'
import { MessageCircleIcon } from './icons'
import { createComment } from '@/app/comments/actions'
import type { CommentNode } from '@/lib/data/comments'
import styles from './comments-list.module.css'

type Props = {
  businessId: string
  slug: string
  comments: CommentNode[]
  currentUserId: string | null
  isLoggedIn: boolean
}

export default function CommentsList({
  businessId,
  slug,
  comments,
  currentUserId,
  isLoggedIn,
}: Props) {
  const [text, setText] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!text.trim()) return
    startTransition(async () => {
      const fd = new FormData()
      fd.set('content', text)
      const res = await createComment(businessId, slug, fd)
      if (!res.ok) {
        setError(res.error)
        return
      }
      setText('')
    })
  }

  return (
    <div className={styles.wrap} id="comments-section">
      <header className={styles.header}>
        <h2 className={styles.title}>
          <MessageCircleIcon size={20} />
          التعليقات {comments.length > 0 && <span className={styles.count}>{comments.length}</span>}
        </h2>
      </header>

      {isLoggedIn ? (
        <form className={styles.form} onSubmit={handleSubmit}>
          <textarea
            className={styles.input}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="قول رأيك..."
            maxLength={500}
            rows={3}
          />
          <div className={styles.formFooter}>
            <span className={styles.hint}>{text.length} / 500</span>
            <button type="submit" className={styles.submit} disabled={isPending || !text.trim()}>
              {isPending ? 'جاري...' : 'انشر'}
            </button>
          </div>
          {error && <div className={styles.error}>{error}</div>}
        </form>
      ) : (
        <div className={styles.loginPrompt}>سجّل دخول عشان تعلّق</div>
      )}

      {comments.length === 0 ? (
        <div className={styles.empty}>
          <MessageCircleIcon size={36} />
          <p>لسه مفيش تعليقات — كن أول واحد</p>
        </div>
      ) : (
        <div className={styles.list}>
          {comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              businessId={businessId}
              slug={slug}
              currentUserId={currentUserId}
              isLoggedIn={isLoggedIn}
            />
          ))}
        </div>
      )}
    </div>
  )
}
