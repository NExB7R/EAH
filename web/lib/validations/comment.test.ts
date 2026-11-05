import { describe, expect, it } from 'vitest'
import { commentImageUrlsSchema } from './comment'

describe('commentImageUrlsSchema', () => {
  it('allows up to three secure image URLs', () => {
    const urls = [
      'https://res.cloudinary.com/example/image/upload/one.jpg',
      'https://res.cloudinary.com/example/image/upload/two.jpg',
      'https://res.cloudinary.com/example/image/upload/three.jpg',
    ]

    expect(commentImageUrlsSchema.safeParse(urls).success).toBe(true)
  })

  it('rejects more than three images', () => {
    const urls = Array.from(
      { length: 4 },
      (_, index) => `https://res.cloudinary.com/example/image/upload/${index}.jpg`,
    )

    expect(commentImageUrlsSchema.safeParse(urls).success).toBe(false)
  })

  it('rejects insecure or malformed URLs', () => {
    expect(commentImageUrlsSchema.safeParse(['http://example.com/image.jpg']).success).toBe(false)
    expect(commentImageUrlsSchema.safeParse(['not-a-url']).success).toBe(false)
  })
})
