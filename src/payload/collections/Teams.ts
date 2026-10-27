import type { CollectionConfig } from 'payload'
import { revalidatePath } from 'next/cache'
import { anyone } from '../access/anyone'
import { isAdmin } from '../access/isAdmin'

export const Teams: CollectionConfig<'teams'> = {
  slug: 'teams',
  access: {
    read: anyone,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'position', 'category', 'showOnHome', 'order'],
    description: 'Manage Coding Club Core Committee, Technical Team, and Faculty Coordinators.',
    group: 'Club Core',
  },
  hooks: {
    afterChange: [
      ({ req: { payload } }) => {
        try {
          revalidatePath('/team')
          revalidatePath('/')
          revalidatePath('/about')
        } catch (e) {
          payload.logger.warn(`Revalidate team error: ${e}`)
        }
      },
    ],
    afterDelete: [
      ({ req: { payload } }) => {
        try {
          revalidatePath('/team')
          revalidatePath('/')
          revalidatePath('/about')
        } catch (e) {
          payload.logger.warn(`Revalidate team delete error: ${e}`)
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
        description: 'Full name of the team member (e.g. John Doe)',
      },
    },
    {
      name: 'position',
      type: 'text',
      required: true,
      admin: { description: 'Role or designation, e.g. Core Lead, Full-Stack Developer, CP Lead' },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      defaultValue: 'core',
      options: [
        { label: 'Core Committee', value: 'core' },
        { label: 'Technical Team', value: 'technical' },
        { label: 'Faculty Coordinator & Leadership', value: 'faculty' },
        { label: 'Design & Media', value: 'design' },
        { label: 'Event & Outreach', value: 'outreach' },
        { label: 'Club Instructor & Teacher', value: 'teachers' },
      ],
      admin: {
        description: 'Category determines which section on the Team or Teachers page this member appears under',
      },
    },
    {
      name: 'isTeacher',
      type: 'checkbox',
      label: 'Is Student Instructor / Teacher',
      defaultValue: false,
      admin: {
        description: 'Check if this person is a teacher/instructor (will show in Teacher section instead of Meet the Team)',
      },
    },
    {
      name: 'teachingSubject',
      type: 'text',
      label: 'Subjects / Courses Taught (For Teachers/Instructors)',
      admin: {
        description: 'E.g. C Programming, Full-Stack Web Development, Python & DSA',
      },
    },
    {
      name: 'showOnHome',
      type: 'checkbox',
      label: 'Show on Home Page (Tick mark to display)',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Tick to feature this member in the "Meet the Team" section on the home page',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 10,
      admin: {
        position: 'sidebar',
        description: 'Display order (1 = first, 2 = second, etc.)',
      },
    },
    {
      name: 'courseYear',
      type: 'text',
      label: 'Course & Year / Department',
      admin: { description: 'E.g. B.Tech Computer Science & Engineering, 3rd Year' },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        description: 'Upload member photo (automatically uploaded and organized in Cloudinary)',
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
