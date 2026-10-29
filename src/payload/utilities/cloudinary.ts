export const CLOUDINARY_CLOUD_NAME =
  process.env.CLOUDINARY_CLOUD_NAME ||
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  ''

export const CLOUDINARY_UPLOAD_PRESET =
  process.env.CLOUDINARY_UPLOAD_PRESET ||
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
  ''

export type CloudinaryFolder =
  | 'certificate'
  | 'codingclub/events/coding-class'
  | 'codingclub/events/hackathon'
  | 'codingclub/events/workshops'
  | 'codingclub/gallery/2026'
  | 'codingclub/gallery/2027'
  | 'codingclub/teams/president'
  | 'codingclub/teams/coordinators'
  | 'codingclub/teams/members'
  | 'codingclub/projects'
  | 'codingclub/certificates'
  | 'codingclub/profiles'
  | 'codingclub/submissions'
  | string

export interface CloudinaryUploadResult {
  asset_id: string
  public_id: string
  version: number
  version_id: string
  signature: string
  width?: number
  height?: number
  format?: string
  resource_type?: string
  created_at?: string
  bytes?: number
  type?: string
  url: string
  secure_url: string
  original_filename?: string
  folder?: string
  [key: string]: unknown
}

/**
 * Uploads a file buffer to Cloudinary under the specified folder hierarchy.
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  filename: string,
  mimetype: string,
  folder: string = 'certificate',
): Promise<CloudinaryUploadResult> {
  const formData = new FormData()
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  formData.append('folder', folder)

  const blob = new Blob([fileBuffer], { type: mimetype || 'application/octet-stream' })
  formData.append('file', blob, filename || 'upload')

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`
  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Cloudinary upload failed (${response.status} ${response.statusText}): ${errorText}`,
    )
  }

  return (await response.json()) as CloudinaryUploadResult
}

/**
 * Helper to generate transformed Cloudinary image URLs on the fly.
 * Example: insert 'w_300,c_limit' into https://res.cloudinary.com/.../upload/...
 */
export function getCloudinaryTransformUrl(secureUrl: string, transformation: string): string {
  if (!secureUrl || !secureUrl.includes('/upload/')) return secureUrl
  return secureUrl.replace('/upload/', `/upload/${transformation}/`)
}

/**
 * Returns a high-res image URL for displaying the certificate document.
 * If the document is a PDF on Cloudinary, Cloudinary rasterizes it to a crystal-clear
 * JPEG image (avoiding 401 ACL/delivery restrictions on raw PDF downloads).
 */
export function getCloudinaryDisplayUrl(url: string | null | undefined): string {
  if (!url) return ''
  if (!url.includes('res.cloudinary.com')) return url
  if (url.toLowerCase().endsWith('.pdf')) {
    return url.replace(/\.pdf($|\?)/i, '.jpg$1')
  }
  return url
}
