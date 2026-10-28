import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers, cookies } from 'next/headers'
import fs from 'fs'
import path from 'path'
import { uploadToCloudinary } from '@/payload/utilities/cloudinary'

export const dynamic = 'force-dynamic'

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024 // 25MB

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function authenticateAdmin(payload: any) {
  const headersList = await headers()
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value

  let authResult = await payload.auth({ headers: headersList })
  let user = authResult.user

  if (!user && token) {
    try {
      const customHeaders = new Headers(headersList)
      customHeaders.set('Authorization', `JWT ${token}`)
      authResult = await payload.auth({ headers: customHeaders })
      user = authResult.user
    } catch {
      // Fallback failed
    }
  }

  const isAdmin = user?.role === 'admin'
  if (!user || !isAdmin) {
    return null
  }
  return user
}

// ─────────────────────────────────────────────────────────────────────────────
// GET: Check ID duplicate or list existing hard-copy certificates
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(req: Request) {
  try {
    const payload = await getPayload({ config: configPromise })
    const user = await authenticateAdmin(payload)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Only administrators can access hard-copy certificate records.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const checkId = searchParams.get('checkId')

    // Quick duplicate check endpoint
    if (checkId) {
      const existing = await payload.find({
        collection: 'certificates',
        where: {
          certificateId: { equals: checkId.trim() },
        },
        limit: 1,
      })
      return NextResponse.json({
        exists: existing.docs.length > 0,
        certificateId: checkId.trim(),
        matchingCert: existing.docs.length > 0 ? {
          studentName: existing.docs[0].studentName,
          internship: existing.docs[0].internship,
          issueDate: existing.docs[0].issueDate,
        } : null,
      })
    }

    // List all hard-copy certificates
    const search = searchParams.get('search') || ''
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereConditions: any[] = [
      {
        or: [
          { certificateType: { equals: 'hard_copy' } },
          { hardCopyUrl: { exists: true } },
        ],
      },
    ]

    if (search.trim()) {
      whereConditions.push({
        or: [
          { certificateId: { contains: search.trim() } },
          { studentName: { contains: search.trim() } },
          { internship: { contains: search.trim() } },
        ],
      })
    }

    const results = await payload.find({
      collection: 'certificates',
      where: {
        and: whereConditions,
      },
      depth: 1,
      limit: 200,
      sort: '-createdAt',
    })

    return NextResponse.json({
      success: true,
      certificates: results.docs,
      total: results.totalDocs,
    })
  } catch (error) {
    console.error('Failed to query hard-copy certificates:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve hard-copy certificate records.' },
      { status: 500 }
    )
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST: Upload and register a new Hard-Copy Certificate
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const payload = await getPayload({ config: configPromise })
    const user = await authenticateAdmin(payload)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Only administrators can upload hard-copy certificates.' },
        { status: 403 }
      )
    }

    const formData = await req.formData()
    const certificateId = ((formData.get('certificateId') as string) || '').trim()
    const studentName = ((formData.get('studentName') as string) || '').trim()
    const eventName = ((formData.get('eventName') as string) || (formData.get('internship') as string) || '').trim()
    const issueDate = ((formData.get('issueDate') as string) || '').trim()
    const department = ((formData.get('department') as string) || '').trim()
    const course = ((formData.get('course') as string) || '').trim()
    const semester = ((formData.get('semester') as string) || '').trim()
    const studentId = formData.get('studentId') as string | null
    const file = formData.get('file') as File | null

    // 1. Validate required fields
    if (!certificateId) {
      return NextResponse.json({ error: 'Certificate Number / ID is required.' }, { status: 400 })
    }
    if (!studentName) {
      return NextResponse.json({ error: 'Student Name is required.' }, { status: 400 })
    }
    if (!eventName) {
      return NextResponse.json({ error: 'Event Name / Programme Name is required.' }, { status: 400 })
    }
    if (!issueDate) {
      return NextResponse.json({ error: 'Issue Date is required.' }, { status: 400 })
    }
    if (!file) {
      return NextResponse.json({ error: 'Certificate document file (JPG/PNG/PDF) is required.' }, { status: 400 })
    }

    // 2. Prevent duplicate certificate numbers
    const existingCerts = await payload.find({
      collection: 'certificates',
      where: {
        certificateId: { equals: certificateId },
      },
      limit: 1,
    })

    if (existingCerts.docs.length > 0) {
      return NextResponse.json(
        {
          error: `Certificate ID "${certificateId}" already exists in the system (issued to "${existingCerts.docs[0].studentName}"). Duplicate certificate numbers are strictly prohibited.`,
        },
        { status: 409 }
      )
    }

    // 3. Validate file MIME type and size
    const mimeType = (file.type || '').toLowerCase()
    const isPdf = mimeType === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    const isImage =
      mimeType.startsWith('image/') ||
      file.name.toLowerCase().endsWith('.jpg') ||
      file.name.toLowerCase().endsWith('.jpeg') ||
      file.name.toLowerCase().endsWith('.png') ||
      file.name.toLowerCase().endsWith('.webp')

    if (!isPdf && !isImage) {
      return NextResponse.json(
        { error: `Unsupported file type (${file.type || 'unknown'}). Please upload a JPG, PNG, WEBP, or PDF certificate document.` },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File size exceeds maximum allowed limit (25MB).' },
        { status: 400 }
      )
    }

    // 4. Read file buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const altText = `${studentName} - ${eventName} Official Hard-Copy Certificate`

    let mediaUrl = ''
    let mediaFilename = sanitizedFileName
    let mediaDocId: number | string | null = null

    // 5. Upload file to Cloudinary under 'codingclub/certificates' with local fallback
    let uploadedToCloudinarySuccessfully = false
    try {
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_UPLOAD_PRESET) {
        payload.logger.info(`Uploading hard-copy certificate "${sanitizedFileName}" to Cloudinary...`)
        const uploadResult = await uploadToCloudinary(
          buffer,
          sanitizedFileName,
          isPdf ? 'application/pdf' : file.type || 'image/jpeg',
          'codingclub/certificates'
        )

        mediaUrl = uploadResult.secure_url
        mediaFilename = `${uploadResult.public_id.split('/').pop()}.${uploadResult.format || (isPdf ? 'pdf' : 'jpg')}`

        // Create Payload Media document
        const mediaDoc = await payload.create({
          collection: 'media',
          overrideAccess: true,
          data: {
            alt: altText,
            folder: 'certificates',
            filename: mediaFilename,
            url: mediaUrl,
            filesize: uploadResult.bytes || buffer.length,
            width: uploadResult.width || null,
            height: uploadResult.height || null,
            mimeType: isPdf ? 'application/pdf' : `image/${uploadResult.format || 'jpeg'}`,
          },
          file: {
            data: buffer,
            name: mediaFilename,
            mimetype: isPdf ? 'application/pdf' : file.type || 'image/jpeg',
            size: buffer.length,
          },
        })

        mediaDocId = mediaDoc.id
        uploadedToCloudinarySuccessfully = true
        payload.logger.info(`Successfully stored hard-copy certificate on Cloudinary: ${mediaUrl}`)
      }
    } catch (cloudinaryError) {
      payload.logger.warn(`Cloudinary upload failed (${cloudinaryError}), falling back to local media storage...`)
    }

    // Fallback to local storage if Cloudinary not configured or failed
    if (!uploadedToCloudinarySuccessfully) {
      const publicMediaDir = path.resolve(process.cwd(), 'public/media')
      if (!fs.existsSync(publicMediaDir)) {
        fs.mkdirSync(publicMediaDir, { recursive: true })
      }

      const uniquePrefix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`
      const localFileName = `${uniquePrefix}-${sanitizedFileName}`
      const localFilePath = path.join(publicMediaDir, localFileName)
      fs.writeFileSync(localFilePath, new Uint8Array(buffer))

      mediaUrl = `/media/${localFileName}`
      mediaFilename = localFileName

      const mediaDoc = await payload.create({
        collection: 'media',
        overrideAccess: true,
        data: {
          alt: altText,
          folder: 'certificates',
          filename: mediaFilename,
          url: mediaUrl,
          filesize: buffer.length,
          mimeType: isPdf ? 'application/pdf' : file.type || 'image/jpeg',
        },
        file: {
          data: buffer,
          name: mediaFilename,
          mimetype: isPdf ? 'application/pdf' : file.type || 'image/jpeg',
          size: buffer.length,
        },
      })
      mediaDocId = mediaDoc.id
      payload.logger.info(`Stored hard-copy certificate locally at ${mediaUrl}`)
    }

    // 6. Save Certificate document in database
    const parsedIssueDate = new Date(issueDate)
    const validIssueDate = isNaN(parsedIssueDate.getTime()) ? new Date().toISOString() : parsedIssueDate.toISOString()

    const certificateDoc = await payload.create({
      collection: 'certificates',
      overrideAccess: true,
      context: { skipEmailHook: true },
      data: {
        certificateType: 'hard_copy',
        certificateId,
        studentName,
        internship: eventName,
        issueDate: validIssueDate,
        startDate: validIssueDate,
        endDate: validIssueDate,
        department: department || 'Computer Sciences & Information Technology',
        course: course || 'Master of Computer Applications (M.C.A.)',
        semester: semester || '1st Semester',
        isIssued: true,
        hardCopyFile: mediaDocId as number,
        hardCopyUrl: mediaUrl,
        ...(studentId ? { student: Number(studentId) } : {}),
      },
    })

    return NextResponse.json({
      success: true,
      message: `Hard-copy certificate ${certificateId} for ${studentName} successfully registered and verified.`,
      certificate: certificateDoc,
      verifyUrl: `/verify/${certificateDoc.certificateId}`,
      viewUrl: `/certificate/${certificateDoc.certificateId}`,
    })
  } catch (error) {
    console.error('Hard-copy certificate upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred while uploading the certificate.' },
      { status: 500 }
    )
  }
}
