import ImageKit from 'imagekit'
import { getImageKitConfig } from '@/lib/parking-config'

/** ImageKit upload API response (subset we use). */
export interface ImageKitUploadResponse {
  url: string
  fileId?: string
  name?: string
}

let imagekit: ImageKit | null = null

function getImageKit(): ImageKit {
  if (!imagekit) {
    const config = getImageKitConfig()
    imagekit = new ImageKit({
      publicKey: config.publicKey,
      privateKey: config.privateKey,
      urlEndpoint: config.urlEndpoint,
    })
  }
  return imagekit
}

/**
 * Upload image buffer to ImageKit and return the public URL.
 */
export async function uploadImageBuffer(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  const ik = getImageKit()
  const result = await ik.upload({
    file: buffer,
    fileName: fileName.replace(/[^a-zA-Z0-9._-]/g, '_'),
  })
  const response = result.response as unknown
  if (response && typeof response === 'object' && 'url' in response && typeof (response as ImageKitUploadResponse).url === 'string') {
    return (response as ImageKitUploadResponse).url
  }
  throw new Error('ImageKit upload did not return URL')
}
