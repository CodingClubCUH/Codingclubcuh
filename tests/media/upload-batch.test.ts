import { describe, it, expect, vi, beforeEach } from 'vitest'

// 1. Setup mocks before importing route
const mockGetAuthUser = vi.fn()
const mockUploadToCloudinary = vi.fn()
const mockPayloadCreate = vi.fn()

vi.mock('@/payload/utilities/getAuthUser', () => ({
  getAuthUser: () => mockGetAuthUser(),
}))

vi.mock('@/payload/utilities/cloudinary', () => ({
  uploadToCloudinary: (...args: any[]) => mockUploadToCloudinary(...args),
}))

vi.mock('payload', () => ({
  getPayload: vi.fn(async () => ({
    create: mockPayloadCreate,
  })),
}))

vi.mock('@payload-config', () => ({
  default: {},
}))

import { POST } from '@/app/api/media/upload-batch/route'

// Helper to create mock image files
function createMockFile(
  name: string,
  type: string,
  content: Uint8Array,
  size?: number
): File {
  const file = new File([content], name, { type })
  if (typeof size === 'number') {
    Object.defineProperty(file, 'size', { value: size })
  }
  return file
}

// Valid headers:
// JPEG: FF D8 FF E0
const VALID_JPEG_HEADER = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46])
// PNG: 89 50 4E 47
const VALID_PNG_HEADER = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
// WebP: RIFF ... WEBP
const VALID_WEBP_HEADER = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, // RIFF
  0x24, 0x00, 0x00, 0x00,
  0x57, 0x45, 0x42, 0x50, // WEBP
])
// SVG: <svg xmlns="http://www.w3.org/2000/svg"></svg>
const VALID_SVG_CONTENT = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"></svg>')

describe('Media Batch Upload Security & Validation (/api/media/upload-batch)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Authentication & Authorization Checks', () => {
    it('rejects unauthenticated requests with 401', async () => {
      mockGetAuthUser.mockResolvedValue({ user: null, isAdmin: false })

      const formData = new FormData()
      formData.append('file', createMockFile('photo.jpg', 'image/jpeg', VALID_JPEG_HEADER))

      const req = new Request('http://localhost:3001/api/media/upload-batch', {
        method: 'POST',
        body: formData,
      })

      const res = await POST(req)
      expect(res.status).toBe(401)
      const data = await res.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('Authentication required')
      expect(mockUploadToCloudinary).not.toHaveBeenCalled()
    })

    it('rejects non-admin (student) requests with 403', async () => {
      mockGetAuthUser.mockResolvedValue({
        user: { id: 12, name: 'Student Bob', role: 'student' },
        isAdmin: false,
      })

      const formData = new FormData()
      formData.append('file', createMockFile('photo.jpg', 'image/jpeg', VALID_JPEG_HEADER))

      const req = new Request('http://localhost:3001/api/media/upload-batch', {
        method: 'POST',
        body: formData,
      })

      const res = await POST(req)
      expect(res.status).toBe(403)
      const data = await res.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('Only administrators can upload media assets')
      expect(mockUploadToCloudinary).not.toHaveBeenCalled()
    })
  })

  describe('Batch & File Boundary Validation', () => {
    beforeEach(() => {
      mockGetAuthUser.mockResolvedValue({
        user: { id: 1, name: 'Admin Alice', role: 'admin' },
        isAdmin: true,
      })
    })

    it('rejects requests with no files provided with 400', async () => {
      const formData = new FormData()

      const req = new Request('http://localhost:3001/api/media/upload-batch', {
        method: 'POST',
        body: formData,
      })

      const res = await POST(req)
      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.success).toBe(false)
      expect(data.error).toBe('No files provided.')
    })

    it('rejects excessive batch sizes (> 20 files) with 400', async () => {
      const formData = new FormData()
      for (let i = 0; i < 21; i++) {
        formData.append('files', createMockFile(`photo${i}.jpg`, 'image/jpeg', VALID_JPEG_HEADER))
      }

      const req = new Request('http://localhost:3001/api/media/upload-batch', {
        method: 'POST',
        body: formData,
      })

      const res = await POST(req)
      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('Batch size exceeds maximum limit of 20 files')
      expect(mockUploadToCloudinary).not.toHaveBeenCalled()
    })

    it('rejects oversized files (> 10MB) with 400', async () => {
      const formData = new FormData()
      // Create a real oversized buffer (> 10MB) starting with valid JPEG header
      const oversizedBuffer = new Uint8Array(10 * 1024 * 1024 + 1024)
      oversizedBuffer.set(VALID_JPEG_HEADER, 0)
      const oversizedFile = new File([oversizedBuffer], 'huge_poster.jpg', { type: 'image/jpeg' })
      formData.append('files', oversizedFile)

      const req = new Request('http://localhost:3001/api/media/upload-batch', {
        method: 'POST',
        body: formData,
      })

      const res = await POST(req)
      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('exceeds maximum allowed limit (10MB)')
      expect(mockUploadToCloudinary).not.toHaveBeenCalled()
    })

    it('rejects unsupported MIME types with 400', async () => {
      const formData = new FormData()
      const scriptFile = createMockFile(
        'payload.sh',
        'application/x-sh',
        new TextEncoder().encode('#!/bin/bash\necho "exploit"')
      )
      formData.append('files', scriptFile)

      const req = new Request('http://localhost:3001/api/media/upload-batch', {
        method: 'POST',
        body: formData,
      })

      const res = await POST(req)
      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('unsupported format')
      expect(mockUploadToCloudinary).not.toHaveBeenCalled()
    })

    it('rejects spoofed file content where magic bytes do not match valid image formats', async () => {
      const formData = new FormData()
      // Pretends to be image/jpeg, but is actually an executable shell text
      const fakeJpg = createMockFile(
        'malicious.jpg',
        'image/jpeg',
        new TextEncoder().encode('MZ_FAKE_EXECUTABLE_HEADER_CONTENT')
      )
      formData.append('files', fakeJpg)

      const req = new Request('http://localhost:3001/api/media/upload-batch', {
        method: 'POST',
        body: formData,
      })

      const res = await POST(req)
      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('contains invalid image data')
      expect(mockUploadToCloudinary).not.toHaveBeenCalled()
    })
  })

  describe('Legitimate Admin Batch Upload Workflow', () => {
    beforeEach(() => {
      mockGetAuthUser.mockResolvedValue({
        user: { id: 1, name: 'Admin Alice', role: 'admin' },
        isAdmin: true,
      })
    })

    it('successfully uploads valid batch of images and creates Payload media docs', async () => {
      mockUploadToCloudinary
        .mockResolvedValueOnce({
          public_id: 'codingclub/gallery/2026/club_event_1',
          secure_url: 'https://res.cloudinary.com/test/image/upload/v1/codingclub/gallery/2026/club_event_1.jpg',
          format: 'jpg',
          bytes: 12345,
          width: 1920,
          height: 1080,
        })
        .mockResolvedValueOnce({
          public_id: 'codingclub/gallery/2026/logo_vector',
          secure_url: 'https://res.cloudinary.com/test/image/upload/v1/codingclub/gallery/2026/logo_vector.svg',
          format: 'svg',
          bytes: 4567,
          width: 500,
          height: 500,
        })

      mockPayloadCreate
        .mockResolvedValueOnce({
          id: 101,
          filename: 'club_event_1.jpg',
          url: 'https://res.cloudinary.com/test/image/upload/v1/codingclub/gallery/2026/club_event_1.jpg',
          alt: 'club event 1',
          width: 1920,
          height: 1080,
        })
        .mockResolvedValueOnce({
          id: 102,
          filename: 'logo_vector.svg',
          url: 'https://res.cloudinary.com/test/image/upload/v1/codingclub/gallery/2026/logo_vector.svg',
          alt: 'logo vector',
          width: 500,
          height: 500,
        })

      const formData = new FormData()
      formData.append('files', createMockFile('club_event_1.jpg', 'image/jpeg', VALID_JPEG_HEADER))
      formData.append('files', createMockFile('logo_vector.svg', 'image/svg+xml', VALID_SVG_CONTENT))

      const req = new Request('http://localhost:3001/api/media/upload-batch', {
        method: 'POST',
        body: formData,
      })

      const res = await POST(req)
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.success).toBe(true)
      expect(data.docs).toHaveLength(2)
      expect(data.docs[0]).toEqual({
        id: 101,
        filename: 'club_event_1.jpg',
        url: 'https://res.cloudinary.com/test/image/upload/v1/codingclub/gallery/2026/club_event_1.jpg',
        alt: 'club event 1',
        width: 1920,
        height: 1080,
      })
      expect(data.docs[1]).toEqual({
        id: 102,
        filename: 'logo_vector.svg',
        url: 'https://res.cloudinary.com/test/image/upload/v1/codingclub/gallery/2026/logo_vector.svg',
        alt: 'logo vector',
        width: 500,
        height: 500,
      })

      expect(mockUploadToCloudinary).toHaveBeenCalledTimes(2)
      expect(mockPayloadCreate).toHaveBeenCalledTimes(2)
      expect(mockPayloadCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: 'media',
          overrideAccess: true,
          data: expect.objectContaining({
            folder: 'gallery/2026',
          }),
        })
      )
    })

    it('supports single-file upload parameter "file"', async () => {
      mockUploadToCloudinary.mockResolvedValueOnce({
        public_id: 'codingclub/gallery/2026/single_pic',
        secure_url: 'https://res.cloudinary.com/test/image/upload/v1/codingclub/gallery/2026/single_pic.png',
        format: 'png',
        bytes: 8888,
        width: 800,
        height: 600,
      })

      mockPayloadCreate.mockResolvedValueOnce({
        id: 201,
        filename: 'single_pic.png',
        url: 'https://res.cloudinary.com/test/image/upload/v1/codingclub/gallery/2026/single_pic.png',
        alt: 'single pic',
        width: 800,
        height: 600,
      })

      const formData = new FormData()
      formData.append('file', createMockFile('single_pic.png', 'image/png', VALID_PNG_HEADER))

      const req = new Request('http://localhost:3001/api/media/upload-batch', {
        method: 'POST',
        body: formData,
      })

      const res = await POST(req)
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.success).toBe(true)
      expect(data.docs).toHaveLength(1)
      expect(data.docs[0].id).toBe(201)
    })
  })

  describe('Vercel Blob Storage & Resilient Batch Uploads', () => {
    beforeEach(() => {
      mockGetAuthUser.mockResolvedValue({
        user: { id: 1, name: 'Admin Alice', role: 'admin' },
        isAdmin: true,
      })
    })

    it('processes uploads via Payload storage adapter when BLOB_READ_WRITE_TOKEN is set', async () => {
      const originalToken = process.env.BLOB_READ_WRITE_TOKEN
      process.env.BLOB_READ_WRITE_TOKEN = 'vercel_blob_rw_teststore123_abc456'

      mockPayloadCreate.mockResolvedValueOnce({
        id: 301,
        filename: 'blob_event.jpg',
        url: 'https://teststore123.public.blob.vercel-storage.com/blob_event.jpg',
        alt: 'blob event',
        width: 1920,
        height: 1080,
      })

      try {
        const formData = new FormData()
        formData.append('file', createMockFile('blob_event.jpg', 'image/jpeg', VALID_JPEG_HEADER))

        const req = new Request('http://localhost:3001/api/media/upload-batch', {
          method: 'POST',
          body: formData,
        })

        const res = await POST(req)
        expect(res.status).toBe(200)
        const data = await res.json()
        expect(data.success).toBe(true)
        expect(data.docs[0].url).toContain('blob.vercel-storage.com')
        expect(mockUploadToCloudinary).not.toHaveBeenCalled()
        expect(mockPayloadCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            collection: 'media',
            file: expect.objectContaining({
              name: 'blob_event.jpg',
              mimetype: 'image/jpeg',
            }),
          })
        )
      } finally {
        if (originalToken !== undefined) {
          process.env.BLOB_READ_WRITE_TOKEN = originalToken
        } else {
          delete process.env.BLOB_READ_WRITE_TOKEN
        }
      }
    })

    it('successfully uploads file larger than 4.5MB within the 10MB limit', async () => {
      const originalToken = process.env.BLOB_READ_WRITE_TOKEN
      process.env.BLOB_READ_WRITE_TOKEN = 'vercel_blob_rw_teststore123_abc456'

      mockPayloadCreate.mockResolvedValueOnce({
        id: 302,
        filename: 'large_photo.jpg',
        url: 'https://teststore123.public.blob.vercel-storage.com/large_photo.jpg',
        alt: 'large photo',
        width: 3840,
        height: 2160,
      })

      try {
        const size6MB = 6 * 1024 * 1024
        const buffer6MB = new Uint8Array(size6MB)
        buffer6MB.set(VALID_JPEG_HEADER, 0)
        const largeFile = new File([buffer6MB], 'large_photo.jpg', { type: 'image/jpeg' })

        const formData = new FormData()
        formData.append('file', largeFile)

        const req = new Request('http://localhost:3001/api/media/upload-batch', {
          method: 'POST',
          body: formData,
        })

        const res = await POST(req)
        expect(res.status).toBe(200)
        const data = await res.json()
        expect(data.success).toBe(true)
        expect(data.docs[0].id).toBe(302)
      } finally {
        if (originalToken !== undefined) {
          process.env.BLOB_READ_WRITE_TOKEN = originalToken
        } else {
          delete process.env.BLOB_READ_WRITE_TOKEN
        }
      }
    })

    it('handles partial failures gracefully without failing the entire batch', async () => {
      const originalToken = process.env.BLOB_READ_WRITE_TOKEN
      process.env.BLOB_READ_WRITE_TOKEN = 'vercel_blob_rw_teststore123_abc456'

      mockPayloadCreate.mockResolvedValueOnce({
        id: 303,
        filename: 'good_photo.jpg',
        url: 'https://teststore123.public.blob.vercel-storage.com/good_photo.jpg',
        alt: 'good photo',
      })
      mockPayloadCreate.mockRejectedValueOnce(new Error('Storage timeout'))

      try {
        const formData = new FormData()
        formData.append('files', createMockFile('good_photo.jpg', 'image/jpeg', VALID_JPEG_HEADER))
        formData.append('files', createMockFile('bad_photo.png', 'image/png', VALID_PNG_HEADER))

        const req = new Request('http://localhost:3001/api/media/upload-batch', {
          method: 'POST',
          body: formData,
        })

        const res = await POST(req)
        expect(res.status).toBe(200)
        const data = await res.json()
        expect(data.success).toBe(true)
        expect(data.docs).toHaveLength(1)
        expect(data.docs[0].id).toBe(303)
        expect(data.errors).toHaveLength(1)
        expect(data.errors[0].filename).toBe('bad_photo.png')
        expect(data.errors[0].error).toContain('Storage timeout')
      } finally {
        if (originalToken !== undefined) {
          process.env.BLOB_READ_WRITE_TOKEN = originalToken
        } else {
          delete process.env.BLOB_READ_WRITE_TOKEN
        }
      }
    })

    it('supports direct client-uploaded blob registration via JSON payload', async () => {
      mockPayloadCreate.mockResolvedValueOnce({
        id: 304,
        filename: 'direct_client_upload.jpg',
        url: 'https://teststore123.public.blob.vercel-storage.com/direct_client_upload.jpg',
        alt: 'direct client upload',
        width: 1200,
        height: 800,
      })

      const req = new Request('http://localhost:3001/api/media/upload-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doc: {
            filename: 'direct_client_upload.jpg',
            url: 'https://teststore123.public.blob.vercel-storage.com/direct_client_upload.jpg',
            size: 5555,
            type: 'image/jpeg',
          },
        }),
      })

      const res = await POST(req)
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.success).toBe(true)
      expect(data.docs[0].id).toBe(304)
      expect(data.docs[0].url).toContain('blob.vercel-storage.com')
    })
  })
})
