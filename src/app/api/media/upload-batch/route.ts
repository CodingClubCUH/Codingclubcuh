import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { uploadToCloudinary } from '@/payload/utilities/cloudinary'
import { getAuthUser } from '@/payload/utilities/getAuthUser'

export const dynamic = 'force-dynamic'

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/gif',
])

const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif'])

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB per file
const MAX_BATCH_FILES = 20

function isValidImageContent(buffer: Buffer, mimeType: string, filename: string): boolean {
  if (buffer.length < 4) return false

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return true

  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return true

  // GIF: 47 49 46 38 ("GIF8")
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) return true

  // WEBP: RIFF....WEBP
  if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return true
  }

  // SVG: text containing <svg
  if (mimeType === 'image/svg+xml' || filename.toLowerCase().endsWith('.svg')) {
    const textStart = buffer.toString('utf8', 0, Math.min(buffer.length, 1024)).toLowerCase()
    if (textStart.includes('<svg') || (textStart.includes('<?xml') && textStart.includes('<svg'))) {
      return true
    }
  }

  return false
}

export async function POST(req: Request) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { user, isAdmin } = await getAuthUser(payload)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Authentication required.' },
        { status: 401 }
      )
    }

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Only administrators can upload media assets.' },
        { status: 403 }
      )
    }

    const formData = await req.formData()
    const files = formData.getAll('files') as File[]
    const singleFile = formData.get('file') as File | null

    const allFiles: File[] = []
    if (files && files.length > 0) {
      allFiles.push(...files)
    } else if (singleFile) {
      allFiles.push(singleFile)
    }

    if (allFiles.length === 0) {
      return NextResponse.json({ success: false, error: 'No files provided.' }, { status: 400 })
    }

    if (allFiles.length > MAX_BATCH_FILES) {
      return NextResponse.json(
        { success: false, error: `Batch size exceeds maximum limit of ${MAX_BATCH_FILES} files.` },
        { status: 400 }
      )
    }

    // Pre-flight file validation before performing any uploads
    interface ValidatedFile {
      file: File
      buffer: Buffer
      mimeType: string
    }

    const validatedFiles: ValidatedFile[] = []

    for (const file of allFiles) {
      if (!file || typeof file.size !== 'number' || file.size === 0) {
        return NextResponse.json(
          { success: false, error: `File "${file?.name || 'unknown'}" is empty or invalid.` },
          { status: 400 }
        )
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { success: false, error: `File "${file.name}" exceeds maximum allowed limit (10MB).` },
          { status: 400 }
        )
      }

      const ext = file.name.split('.').pop()?.toLowerCase() || ''
      const mime = file.type || ''
      const isAllowedMime =
        ALLOWED_MIME_TYPES.has(mime) ||
        (ALLOWED_EXTENSIONS.has(ext) && (!mime || mime === 'application/octet-stream'))

      if (!isAllowedMime) {
        return NextResponse.json(
          {
            success: false,
            error: `File "${file.name}" has an unsupported format (${mime || 'unknown'}). Only JPEG, PNG, WEBP, SVG, and GIF images are accepted.`,
          },
          { status: 400 }
        )
      }

      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      if (!isValidImageContent(buffer, mime, file.name)) {
        return NextResponse.json(
          {
            success: false,
            error: `File "${file.name}" contains invalid image data.`,
          },
          { status: 400 }
        )
      }

      const resolvedMime = mime && ALLOWED_MIME_TYPES.has(mime)
        ? mime
        : ext === 'png'
          ? 'image/png'
          : ext === 'webp'
            ? 'image/webp'
            : ext === 'gif'
              ? 'image/gif'
              : ext === 'svg'
                ? 'image/svg+xml'
                : 'image/jpeg'

      validatedFiles.push({
        file,
        buffer,
        mimeType: resolvedMime,
      })
    }

    // Upload all files concurrently to Cloudinary and create Media documents
    const createdDocs = await Promise.all(
      validatedFiles.map(async ({ file, buffer, mimeType }) => {
        const altText = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
        const folder = 'gallery/2026'

        // 1. Upload directly to Cloudinary
        const uploadResult = await uploadToCloudinary(
          buffer,
          file.name,
          mimeType,
          `codingclub/${folder}`
        )

        // 2. Persist media document in Payload DB
        const mediaDoc = await payload.create({
          collection: 'media',
          overrideAccess: true,
          data: {
            alt: altText,
            folder: folder,
            filename: `${uploadResult.public_id.split('/').pop()}.${uploadResult.format || 'jpg'}`,
            url: uploadResult.secure_url,
            filesize: uploadResult.bytes || buffer.length,
            width: uploadResult.width || null,
            height: uploadResult.height || null,
            mimeType: `image/${uploadResult.format || 'jpeg'}`,
          },
        })

        return {
          id: mediaDoc.id,
          filename: mediaDoc.filename,
          url: mediaDoc.url,
          alt: mediaDoc.alt,
          width: mediaDoc.width,
          height: mediaDoc.height,
        }
      })
    )

    return NextResponse.json({
      success: true,
      docs: createdDocs,
    })
  } catch (error) {
    console.error('Batch upload error:', error)
    const message = error instanceof Error ? error.message : 'Upload failed'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
