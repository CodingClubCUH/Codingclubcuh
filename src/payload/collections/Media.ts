import type { CollectionConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { anyone } from '../access/anyone'
import { isAdmin } from '../access/isAdmin'
import { CLOUDINARY_CLOUD_NAME, getCloudinaryTransformUrl, uploadToCloudinary } from '../utilities/cloudinary'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: anyone,
    update: isAdmin,
  },
  admin: {
    useAsTitle: 'alt',
    defaultColumns: ['filename', 'alt', 'folder', 'updatedAt'],
    description: 'Cloudinary Media library for Coding Club CUH.',
    group: 'Content & Media',
  },
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        try {
          let fileBuffer: Buffer | null = null
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const reqAny = req as any
          const fileObj =
            req.file ||
            (reqAny.files && (reqAny.files.file ? (Array.isArray(reqAny.files.file) ? reqAny.files.file[0] : reqAny.files.file) : Object.values(reqAny.files)[0]))

          if (fileObj) {
            if (fileObj.data && fileObj.data.length > 0) {
              fileBuffer = Buffer.isBuffer(fileObj.data) ? fileObj.data : Buffer.from(fileObj.data)
            } else if (typeof fileObj.arrayBuffer === 'function') {
              const ab = await fileObj.arrayBuffer()
              fileBuffer = Buffer.from(ab)
            } else if (fileObj.tempFilePath) {
              try {
                const fs = await import('fs/promises')
                fileBuffer = await fs.readFile(fileObj.tempFilePath)
              } catch (e) {
                req.payload.logger.warn(`Could not read tempFilePath: ${e}`)
              }
            }
          }

          const fileName = fileObj?.name || (data.filename as string) || 'upload'
          const mimeType = fileObj?.mimetype || (data.mimeType as string) || 'application/octet-stream'

          if (fileBuffer) {
            // Determine target Cloudinary folder based on user selection or default
            const subfolder = (data.folder as string) || 'gallery/2026'
            const targetFolder =
              subfolder === 'certificate'
                ? 'certificate'
                : subfolder.startsWith('codingclub/')
                  ? subfolder
                  : `codingclub/${subfolder}`

            req.payload.logger.info(
              `Uploading file "${fileName}" to Cloudinary under "${targetFolder}"...`,
            )
            const uploadResult = await uploadToCloudinary(
              fileBuffer,
              fileName,
              mimeType,
              targetFolder,
            )

            data.url = uploadResult.secure_url
            if (uploadResult.bytes) data.filesize = uploadResult.bytes
            if (uploadResult.width) data.width = uploadResult.width
            if (uploadResult.height) data.height = uploadResult.height
            if (uploadResult.format) {
              data.mimeType =
                uploadResult.format.toLowerCase() === 'pdf'
                  ? 'application/pdf'
                  : `image/${uploadResult.format}`
            }
            if (!data.filename) {
              data.filename = `${uploadResult.public_id.split('/').pop()}.${uploadResult.format || 'jpg'}`
            }

            // Populate on-the-fly Cloudinary transformation URLs for image sizes
            if (data.sizes && typeof data.sizes === 'object') {
              const transforms: Record<string, string> = {
                thumbnail: 'w_300,c_limit',
                square: 'w_500,h_500,c_fill',
                small: 'w_600,c_limit',
                medium: 'w_900,c_limit',
                large: 'w_1400,c_limit',
                xlarge: 'w_1920,c_limit',
                og: 'w_1200,h_630,c_fill',
              }
              for (const [sizeName, transform] of Object.entries(transforms)) {
                if (data.sizes[sizeName]) {
                  data.sizes[sizeName].url = getCloudinaryTransformUrl(
                    uploadResult.secure_url,
                    transform,
                  )
                }
              }
            }
            req.payload.logger.info(`Uploaded to Cloudinary: ${uploadResult.secure_url}`)
          }
        } catch (err) {
          req.payload.logger.error(`Error uploading to Cloudinary: ${err}`)
          throw err
        }
        return data
      },
    ],
    afterRead: [
      ({ doc }) => {
        if (doc?.url && typeof doc.url === 'string') {
          if (doc.url.startsWith('/api/media/file/') && doc.filename) {
            const folder = doc.folder || 'gallery/2026'
            const targetFolder =
              folder === 'certificate'
                ? 'certificate'
                : folder.startsWith('codingclub/')
                  ? folder
                  : `codingclub/${folder}`
            doc.url = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${targetFolder}/${doc.filename}`
          }
          if (doc.url.includes('res.cloudinary.com')) {
            const isPdf = doc.url.toLowerCase().endsWith('.pdf') || (doc.mimeType && doc.mimeType.includes('pdf'))
            if (!isPdf) {
              doc.thumbnailURL = getCloudinaryTransformUrl(doc.url, 'w_300,c_limit')
            } else {
              // PDF preview thumbnail on Cloudinary is rendered as .jpg
              doc.thumbnailURL = getCloudinaryTransformUrl(doc.url.replace(/\.pdf($|\?)/i, '.jpg$1'), 'w_300,c_limit')
            }
          }
        }
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'folder',
      type: 'select',
      defaultValue: 'gallery/2026',
      options: [
        { label: 'Certificates (Hard-Copy)', value: 'certificate' },
        { label: 'Events > Coding Class', value: 'events/coding-class' },
        { label: 'Events > Hackathon', value: 'events/hackathon' },
        { label: 'Events > Workshops', value: 'events/workshops' },
        { label: 'Gallery > 2026', value: 'gallery/2026' },
        { label: 'Gallery > 2027', value: 'gallery/2027' },
        { label: 'Teams > President', value: 'teams/president' },
        { label: 'Teams > Coordinators', value: 'teams/coordinators' },
        { label: 'Teams > Members', value: 'teams/members' },
        { label: 'Projects', value: 'projects' },
        { label: 'Certificates', value: 'certificates' },
        { label: 'Profiles', value: 'profiles' },
        { label: 'Submissions', value: 'submissions' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Destination folder in Cloudinary (e.g. certificate or codingclub/...)',
      },
    },
    {
      name: 'alt',
      type: 'text',
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
  upload: {
    // Media is persisted remotely to Cloudinary CDN
    staticDir: path.resolve(dirname, '../../public/media'),
    disableLocalStorage: true,
    adminThumbnail: ({ doc }) => {
      return (doc?.thumbnailURL || doc?.url || null) as string | null
    },
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
}
