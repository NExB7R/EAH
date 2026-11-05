'use client'

import { useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import CommentItem from './comment-item'
import { MessageCircleIcon, ImageIcon, CloseIcon } from './icons'
import { createComment } from '@/app/comments/actions'
import { offlineOrQueue } from '@/lib/offline/mutations'
import type { CommentNode } from '@/lib/data/comments'
import styles from './comments-list.module.css'

type Props = {
  businessId: string
  slug: string
  comments: CommentNode[]
  currentUserId: string | null
  isLoggedIn: boolean
  followingRootIds?: string[]
}

export default function CommentsList({
  businessId,
  slug,
  comments,
  currentUserId,
  isLoggedIn,
  followingRootIds = [],
}: Props) {
  const followingSet = new Set(followingRootIds)
  const [text, setText] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const uploadingRef = useRef(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files || uploadingRef.current) return
    setError(null)
    const remaining = 3 - images.length
    if (remaining <= 0) {
      setError('أقصى 3 صور')
      return
    }

    const toUpload = Array.from(files).slice(0, remaining)
    uploadingRef.current = true
    setUploading(true)

    try {
      for (const f of toUpload) {
        const fd = new FormData()
        fd.append('file', f)
        try {
          const res = await fetch('/api/upload/comment-image', { method: 'POST', body: fd })
          const data = (await res.json()) as { url?: string; error?: string }
          if (!res.ok || !data.url) {
            setError(data.error ?? 'فشل رفع الصورة')
            break
          }
          setImages((prev) => [...prev, data.url!])
        } catch {
          setError('فشل الاتصال')
          break
        }
      }
    } finally {
      uploadingRef.current = false
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const removeImage = (url: string) => {
    setImages((prev) => prev.filter((u) => u !== url))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setNotice(null)
    if (!text.trim()) return
    startTransition(async () => {
      const fd = new FormData()
      fd.set('content', text)
      fd.set('image_urls', JSON.stringify(images))

      try {
        const res = await offlineOrQueue(() => createComment(businessId, slug, fd), 'comment', {
          businessId,
          slug,
          content: text,
          parentId: null,
          imageUrls: images,
        })
        if (!res.ok) {
          setError(res.error)
          return
        }

        setText('')
        setImages([])
        setNotice(
          res.queued
            ? 'التعليق وصوره محفوظين على جهازك وسيتم إرسالهم عند عودة الاتصال.'
            : 'تم إرسال تعليقك بنجاح.',
        )
      } catch {
        setError('تعذر إرسال التعليق أو حفظه على الجهاز. جرّب مرة أخرى.')
      }
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
          {images.length > 0 && (
            <div className={styles.previews}>
              {images.map((url) => (
                <div key={url} className={styles.preview}>
                  <Image src={url} alt="" fill sizes="60px" style={{ objectFit: 'cover' }} />
                  <button
                    type="button"
                    className={styles.previewX}
                    onClick={() => removeImage(url)}
                    aria-label="مسح"
                  >
                    <CloseIcon size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className={styles.formFooter}>
            <div className={styles.formLeft}>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                disabled={uploading || images.length >= 3}
                onChange={(e) => handleFiles(e.target.files)}
                style={{ display: 'none' }}
                id="comment-images"
              />
              <label
                htmlFor="comment-images"
                className={`${styles.attachBtn} ${uploading || images.length >= 3 ? styles.attachDisabled : ''}`}
                aria-disabled={uploading || images.length >= 3}
              >
                <ImageIcon size={14} />
                <span>{uploading ? '...' : `صورة (${images.length}/3)`}</span>
              </label>
              <span className={styles.hint}>{text.length} / 500</span>
            </div>
            <button
              type="submit"
              className={styles.submit}
              disabled={isPending || uploading || !text.trim()}
            >
              {isPending ? 'جاري...' : 'انشر'}
            </button>
          </div>
          {error && <div className={styles.error}>{error}</div>}
          {notice && (
            <p className={styles.notice} role="status">
              {notice}
            </p>
          )}
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
              isFollowing={followingSet.has(c.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
