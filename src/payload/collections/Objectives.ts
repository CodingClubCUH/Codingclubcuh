import type { CollectionConfig } from 'payload'
import { revalidatePath } from 'next/cache'
import { anyone } from '../access/anyone'
import { isAdmin } from '../access/isAdmin'

export const Objectives: CollectionConfig = {
  slug: 'objectives',
  access: {
    read: anyone,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'icon', 'showOnWebsite', 'order'],
    description: 'Manage Key Objectives of Coding Club displayed on the home page.',
    group: 'Club Core',
  },
  hooks: {
    afterChange: [
      ({ req: { payload } }) => {
        try {
          revalidatePath('/')
          revalidatePath('/about')
        } catch (e) {
          payload.logger.warn(`Revalidate objectives error: ${e}`)
        }
      },
    ],
    afterDelete: [
      ({ req: { payload } }) => {
        try {
          revalidatePath('/')
          revalidatePath('/about')
        } catch (e) {
          payload.logger.warn(`Revalidate objectives delete error: ${e}`)
        }
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Objective title (e.g. Classes By Students, Development Activities)',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Details and bullet points explaining this objective',
      },
    },
    {
      name: 'icon',
      type: 'select',
      defaultValue: 'BookOpen',
      options: [
        { label: 'BookOpen (Classes / Education)', value: 'BookOpen' },
        { label: 'Code2 (Programming / Dev)', value: 'Code2' },
        { label: 'Rocket (Innovation / Hackathons)', value: 'Rocket' },
        { label: 'Users (Community / Peer-learning)', value: 'Users' },
        { label: 'Globe (Web & Open Source)', value: 'Globe' },
        { label: 'Cpu (AI & Hardware)', value: 'Cpu' },
        { label: 'Lightbulb (Ideation / Workshops)', value: 'Lightbulb' },
        { label: 'Layout (Design & UI/UX)', value: 'Layout' },
      ],
      admin: {
        description: 'Icon displayed next to the objective',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        description: 'Upload an illustration or photo for this objective',
      },
    },
    {
      name: 'imageUrl',
      type: 'text',
      label: 'Direct Image URL (Optional)',
      admin: {
        description: 'Direct Cloudinary or image URL if not uploading via media collection',
      },
    },
    {
      name: 'showOnWebsite',
      type: 'checkbox',
      label: 'Show in Key Objectives on Website (Tick mark to display)',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Tick to display this objective in the Key Objectives section',
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
  ],
}
