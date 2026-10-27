import type { CollectionConfig } from 'payload'
import { anyone } from '../access/anyone'
import { isAdmin } from '../access/isAdmin'

export const Achievements: CollectionConfig<'achievements'> = {
  slug: 'achievements',
  access: {
    read: anyone,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'date'],
    group: 'Club Core',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Hackathon', value: 'hackathon' },
        { label: 'Coding Competition', value: 'competition' },
        { label: 'Student Achievement', value: 'student' },
        { label: 'Club Milestone', value: 'milestone' },
        { label: 'Certification', value: 'certification' },
        { label: 'Award', value: 'award' },
      ],
      admin: { position: 'sidebar' }
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: { position: 'sidebar' }
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'link',
      type: 'text',
      admin: { description: 'Optional link to certificate or project' }
    }
  ],
}
