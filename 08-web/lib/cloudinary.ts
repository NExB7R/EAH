import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

// Watermark — لوجو EAH شفاف في النص
const WATERMARK = {
  overlay: 'eah:branding:watermark',
  gravity: 'center',
  opacity: 35,
  width: 500,
  crop: 'scale',
}

// صور الأنشطة — مع watermark
const BIZ_TRANSFORM = [
  { width: 1600, height: 1600, crop: 'limit', quality: 'auto:good', fetch_format: 'auto', flags: 'progressive' },
  WATERMARK,
]

// avatars — بدون watermark
const AVATAR_TRANSFORM = [
  { width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto:good', fetch_format: 'auto' },
]

export type UploadResult = {
  url: string
  publicId: string
  width: number
  height: number
  bytes: number
  format: string
}

export async function uploadToCloudinary(
  file: File,
  folder: string
): Promise<UploadResult> {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const dataUri = `data:${file.type};base64,${buffer.toString('base64')}`

  const transform = folder.includes('avatar') ? AVATAR_TRANSFORM : BIZ_TRANSFORM

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: `eah/${folder}`,
    resource_type: 'image',
    transformation: transform,
    overwrite: false,
    unique_filename: true,
    use_filename: false,
  })

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
    format: result.format,
  }
}
