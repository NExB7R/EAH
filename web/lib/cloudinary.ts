import 'server-only'
import crypto from 'crypto'

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME
const API_KEY = process.env.CLOUDINARY_API_KEY
const API_SECRET = process.env.CLOUDINARY_API_SECRET

export type UploadResult = { ok: true; url: string } | { ok: false; error: string }

function sign(params: Record<string, string | number>, secret: string): string {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&')
  return crypto
    .createHash('sha1')
    .update(sorted + secret)
    .digest('hex')
}

export async function uploadImage(
  file: File,
  folder: string,
  maxSizeBytes = 5 * 1024 * 1024,
): Promise<UploadResult> {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    return { ok: false, error: 'Cloudinary مش مضبوط' }
  }

  if (!file.type.startsWith('image/')) {
    return { ok: false, error: 'الملف مش صورة' }
  }

  if (file.size > maxSizeBytes) {
    return { ok: false, error: 'حجم الصورة كبير' }
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const params = { folder, timestamp }
  const signature = sign(params, API_SECRET)

  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', API_KEY)
  formData.append('timestamp', String(timestamp))
  formData.append('folder', folder)
  formData.append('signature', signature)

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    })
    const data = (await res.json()) as { secure_url?: string; error?: { message: string } }
    if (!res.ok || !data.secure_url) {
      return { ok: false, error: data.error?.message ?? 'فشل الرفع' }
    }
    return { ok: true, url: data.secure_url }
  } catch {
    return { ok: false, error: 'فشل الاتصال بـ Cloudinary' }
  }
}
