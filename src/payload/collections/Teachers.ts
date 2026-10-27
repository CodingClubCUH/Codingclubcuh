import type { CollectionConfig } from 'payload'
import { revalidatePath } from 'next/cache'
import { anyone } from '../access/anyone'
import { isAdmin } from '../access/isAdmin'

export const Teachers: CollectionConfig = {
  slug: 'teachers',
  access: {
    read: anyone,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'position', 'subjectsTaught', 'showOnHome', 'order'],
    description: 'Manage Coding Club student instructors and teachers who teach courses, workshops, and bootcamps.',
    group: 'Club Core',
  },
  hooks: {
    afterChange: [
      ({ req: { payload } }) => {
        try {
          revalidatePath('/')
          revalidatePath('/team')
        } catch (e) {
          payload.logger.warn(`Revalidate teacher error: ${e}`)
        }
      },
    ],
    afterDelete: [
      ({ req: { payload } }) => {
        try {
          revalidatePath('/')
          revalidatePath('/team')
        } catch (e) {
          payload.logger.warn(`Revalidate teacher delete error: ${e}`)
        }
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Full name of the instructor / teacher (e.g. Ajay Sharma)',
      },
    },
    {
      name: 'position',
      type: 'text',
      required: true,
      label: 'Instructor Role / Title',
      admin: {
        description: 'E.g. Lead Instructor, Web Development Mentor, Python & DSA Instructor',
      },
    },
    {
      name: 'subjectsTaught',
      type: 'text',
      required: true,
      label: 'Subjects / Courses Taught',
      admin: {
        description: 'E.g. C Programming, Full-Stack Web Development, Python & DSA',
      },
    },
    {
      name: 'courseYear',
      type: 'text',
      label: 'Course & Year / Department',
      admin: {
        description: 'E.g. B.Tech Computer Science & Engineering, 3rd Year',
      },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        description: 'Upload instructor photo (stored and organized in Cloudinary)',
      },
    },
    {
      name: 'photoUrl',
      type: 'text',
      label: 'Photo URL (Direct Link)',
      admin: {
        description: 'Optional direct Cloudinary or image URL if not uploading a media file',
      },
    },
    {
      name: 'showOnHome',
      type: 'checkbox',
      label: 'Show in Home Page Teachers Section',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Tick to feature in the "Meet Our Student Instructors" section on the home page',
      },
    },
    {
      name: 'order',
      type: 'number',
      label: 'Display Order',
      defaultValue: 10,
      admin: {
        position: 'sidebar',
        description: 'Display order (1 = first, 2 = second, etc.)',
      },
    },
    {
      name: 'linkedin',
      type: 'text',
      label: 'LinkedIn Profile URL',
      admin: { description: 'https://linkedin.com/in/username' },
    },
    {
      name: 'github',
      type: 'text',
      label: 'GitHub Profile URL',
      admin: { description: 'https://github.com/username' },
    },
  ],
}
