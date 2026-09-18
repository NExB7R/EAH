import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

//  إعدادات الضغط التلقائي — جودة عالية + حجم أقل ما يمكن
const AUTO_TRANSFORM = [
  {
    width: 1600,
    height: 1600,
    crop: 'limit',
    quality: 'auto:good',
    fetch_format: 'auto',
    flags: 'progressive',
  },
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

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: `eah/${folder}`,
    resource_type: 'image',
    transformation: AUTO_TRANSFORM,
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
